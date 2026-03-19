"""
Vectorized implementation of the 3D Rosenthal moving point-source solution.

Equation:
    T(x, y, z) = T₀ + (ηP) / (2πk·R) · exp(−v(R + ξ) / (2α))

Where ξ = x in the moving reference frame (laser at origin, moving in +x).
R = √(ξ² + y² + z²)

Coordinate system:
  - x: scan direction (laser moves in +x)
  - y: transverse
  - z: depth (positive downward into material)
  - Laser is at the origin of the moving reference frame.
"""

import numpy as np
from dataclasses import dataclass
from typing import Tuple


@dataclass
class PhysicsParams:
    power: float        # W
    speed: float        # m/s
    absorptivity: float # dimensionless
    conductivity: float # W/m·K
    diffusivity: float  # m²/s
    liquidus: float     # K
    preheat: float      # K


def compute_temperature(
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    p: PhysicsParams,
) -> np.ndarray:
    """
    Evaluate the Rosenthal temperature field at arbitrary (x, y, z) positions.
    All arrays must be broadcastable. Returns temperature in Kelvin.
    """
    R = np.sqrt(x**2 + y**2 + z**2)
    R = np.maximum(R, 1e-10)  # avoid division by zero at source
    T = (
        p.preheat
        + (p.absorptivity * p.power)
        / (2 * np.pi * p.conductivity * R)
        * np.exp(-p.speed * (R + x) / (2 * p.diffusivity))
    )
    return T


def compute_temperature_field(
    p: PhysicsParams,
    x_range: Tuple[float, float],
    y_range: Tuple[float, float],
    z_range: Tuple[float, float],
    resolution: int,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute the 3D temperature field on a regular grid.

    Returns:
        T: shape (nx, ny, nz) temperature array in Kelvin
        x, y, z: 1D coordinate arrays (meters)
    """
    # Proportional resolution in each axis based on range size
    x_len = x_range[1] - x_range[0]
    y_len = y_range[1] - y_range[0]
    z_len = z_range[1] - z_range[0]
    total_len = x_len + y_len + z_len

    # Distribute resolution proportionally, minimum 10 per axis
    nx = max(10, round(resolution * x_len / total_len))
    ny = max(10, round(resolution * y_len / total_len))
    nz = max(10, round(resolution * z_len / total_len))

    x = np.linspace(x_range[0], x_range[1], nx)
    y = np.linspace(y_range[0], y_range[1], ny)
    z = np.linspace(z_range[0], z_range[1], nz)

    X, Y, Z = np.meshgrid(x, y, z, indexing="ij")
    T = compute_temperature(X, Y, Z, p)
    return T, x, y, z


def find_melt_pool_dimensions(
    T: np.ndarray,
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    liquidus: float,
) -> Tuple[float, float, float]:
    """
    Find melt pool length, width, depth (all in meters) by searching for the
    maximum extent of the T >= liquidus region.
    """
    molten = T >= liquidus

    if not np.any(molten):
        return 0.0, 0.0, 0.0

    # Indices where any cross-section is molten
    x_idx = np.any(molten, axis=(1, 2))
    y_idx = np.any(molten, axis=(0, 2))
    z_idx = np.any(molten, axis=(0, 1))

    x_molten = x[x_idx]
    y_molten = y[y_idx]
    z_molten = z[z_idx]

    length = x_molten[-1] - x_molten[0] if len(x_molten) > 1 else 0.0
    width = y_molten[-1] - y_molten[0] if len(y_molten) > 1 else 0.0
    depth = z_molten[-1] - z_molten[0] if len(z_molten) > 1 else 0.0

    return float(length), float(width), float(depth)


def compute_metrics(
    T: np.ndarray,
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    p: PhysicsParams,
) -> dict:
    """
    Compute derived melt pool metrics.

    Returns a dict with:
        length_um, width_um, depth_um  [micrometers]
        aspect_ratio                   [depth / (width/2)]
        cooling_rate_Ks                [K/s] at trailing edge
        G_Km                           [K/m] thermal gradient magnitude at liquidus boundary
        R_ms                           [m/s] solidification rate
        G_over_R                       [K·s/m²]
    """
    length_m, width_m, depth_m = find_melt_pool_dimensions(T, x, y, z, p.liquidus)

    length_um = length_m * 1e6
    width_um = width_m * 1e6
    depth_um = depth_m * 1e6
    aspect_ratio = depth_m / (width_m / 2) if width_m > 0 else 0.0

    # --- Cooling rate at trailing edge (x_min of melt pool, y=0, z=0) ---
    # dT/dt ≈ v · ∂T/∂x  (in moving frame, ∂T/∂t = -v · ∂T/∂x)
    # We evaluate at the rearmost point of the melt pool centerline.
    cooling_rate = _compute_cooling_rate(x, y, z, T, p)

    # --- Thermal gradient G = |∇T| at the liquidus boundary ---
    G, R_s = _compute_G_and_R(x, y, z, T, p)

    G_over_R = G / R_s if R_s > 0 else 0.0

    return {
        "length_um": round(length_um, 2),
        "width_um": round(width_um, 2),
        "depth_um": round(depth_um, 2),
        "aspect_ratio": round(aspect_ratio, 4),
        "cooling_rate_Ks": round(cooling_rate, 0),
        "G_Km": round(G, 0),
        "R_ms": round(R_s, 6),
        "G_over_R": round(G_over_R, 0),
    }


def _compute_cooling_rate(
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    T: np.ndarray,
    p: PhysicsParams,
) -> float:
    """
    Cooling rate dT/dt at trailing edge of melt pool.
    dT/dt = -v · ∂T/∂x  (negative because temperature drops behind laser)
    We evaluate analytically at the trailing edge point.
    """
    # Find trailing edge: min-x point on melt pool centerline (y=0, z=0)
    # Use y-center and z-surface indices
    iy = len(y) // 2
    iz = 0

    molten_x = T[:, iy, iz] >= p.liquidus
    if not np.any(molten_x):
        return 0.0

    x_trail = x[molten_x][0]  # rearmost (min-x) molten point
    dx = x[1] - x[0]

    # Analytical ∂T/∂x at trailing edge (y=0, z=0)
    # Using finite differences on the analytical function for stability
    T_fwd = compute_temperature(
        np.array([x_trail + dx]),
        np.array([0.0]),
        np.array([1e-9]),  # tiny z to avoid singularity
        p,
    )
    T_bwd = compute_temperature(
        np.array([x_trail - dx]),
        np.array([0.0]),
        np.array([1e-9]),
        p,
    )
    dT_dx = float((T_fwd - T_bwd) / (2 * dx))
    cooling_rate = abs(p.speed * dT_dx)
    return cooling_rate


def _compute_G_and_R(
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    T: np.ndarray,
    p: PhysicsParams,
) -> Tuple[float, float]:
    """
    Compute thermal gradient G = |∇T| and solidification rate R_s at the
    trailing edge of the melt pool boundary (y=0, z=0 plane).

    R_s = v · cos(θ) where θ is the angle between scan direction and
    the outward normal to the melt pool boundary.
    """
    iy = len(y) // 2
    iz = 0

    molten_x = T[:, iy, iz] >= p.liquidus
    if not np.any(molten_x):
        return 0.0, 0.0

    x_trail = x[molten_x][0]
    dx = max(x[1] - x[0], 1e-8)

    # Evaluate gradient at trailing edge
    eps = dx
    # ∂T/∂x
    T_xp = float(compute_temperature(np.array([x_trail + eps]), np.array([0.0]), np.array([1e-9]), p))
    T_xm = float(compute_temperature(np.array([x_trail - eps]), np.array([0.0]), np.array([1e-9]), p))
    dT_dx = (T_xp - T_xm) / (2 * eps)

    # ∂T/∂y
    eps_y = max(y[1] - y[0], 1e-8) if len(y) > 1 else 1e-6
    T_yp = float(compute_temperature(np.array([x_trail]), np.array([eps_y]), np.array([1e-9]), p))
    T_ym = float(compute_temperature(np.array([x_trail]), np.array([-eps_y]), np.array([1e-9]), p))
    dT_dy = (T_yp - T_ym) / (2 * eps_y)

    # ∂T/∂z — evaluate just below surface
    eps_z = max(z[1] - z[0], 1e-8) if len(z) > 1 else 1e-6
    T_zp = float(compute_temperature(np.array([x_trail]), np.array([0.0]), np.array([eps_z * 2]), p))
    T_zm = float(compute_temperature(np.array([x_trail]), np.array([0.0]), np.array([1e-9]), p))
    dT_dz = (T_zp - T_zm) / eps_z

    grad = np.array([dT_dx, dT_dy, dT_dz])
    G = float(np.linalg.norm(grad))

    # Outward normal to melt pool boundary points in direction of -∇T
    # (temperature decreases away from pool)
    if G > 0:
        normal = -grad / G
        cos_theta = abs(float(normal[0]))  # angle with scan direction (x-axis)
    else:
        cos_theta = 0.0

    R_s = p.speed * cos_theta
    return G, R_s


def compute_defect_risks(
    metrics: dict,
    layer_thickness_um: float,
    hatch_spacing_um: float,
) -> dict:
    """
    Evaluate defect risk indicators from melt pool metrics.

    Keyholing:      aspect ratio (depth / half-width) > 1.5
    Lack of fusion: pool depth < layer thickness OR pool width < hatch spacing
    Balling:        length / width > π  (Plateau–Rayleigh instability)
    """
    depth_um = metrics["depth_um"]
    width_um = metrics["width_um"]
    length_um = metrics["length_um"]
    aspect_ratio = metrics["aspect_ratio"]

    keyholing = aspect_ratio > 1.5
    lack_of_fusion = (depth_um < layer_thickness_um) or (width_um < hatch_spacing_um)
    balling = (length_um / width_um > np.pi) if width_um > 0 else False

    return {
        "keyholing": bool(keyholing),
        "lack_of_fusion": bool(lack_of_fusion),
        "balling": bool(balling),
    }


def get_cross_sections(
    T: np.ndarray,
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extract 2D cross-sections from the 3D temperature field.

    Returns:
        T_xz: shape (nx, nz) — slice at y=0 (centerline, longitudinal depth view)
        T_xy: shape (nx, ny) — slice at z=0 (surface, plan view)
    """
    iy_center = len(y) // 2
    iz_surface = 0

    T_xz = T[:, iy_center, :]    # (nx, nz)
    T_xy = T[:, :, iz_surface]   # (nx, ny)

    return T_xz, T_xy
