from pydantic import BaseModel, Field
from typing import List


class GridParams(BaseModel):
    x_range: List[float] = Field(default=[-0.0005, 0.001], description="x range in meters [min, max]")
    y_range: List[float] = Field(default=[-0.0004, 0.0004], description="y range in meters [min, max]")
    z_range: List[float] = Field(default=[0.0, 0.0003], description="z range in meters [min, max]")
    resolution: int = Field(default=80, ge=10, le=150, description="Grid resolution (cubic root of total points)")


class ComputeRequest(BaseModel):
    power: float = Field(..., gt=0, description="Laser power in Watts")
    speed: float = Field(..., gt=0, description="Scan speed in m/s")
    absorptivity: float = Field(..., gt=0, le=1.0, description="Absorptivity (dimensionless)")
    conductivity: float = Field(..., gt=0, description="Thermal conductivity in W/m·K")
    diffusivity: float = Field(..., gt=0, description="Thermal diffusivity in m²/s")
    liquidus: float = Field(..., gt=0, description="Liquidus temperature in Kelvin")
    preheat: float = Field(..., gt=0, description="Preheat/ambient temperature in Kelvin")
    grid: GridParams = Field(default_factory=GridParams)


class TemperatureField(BaseModel):
    data: List[float]
    shape: List[int]
    x: List[float]
    y: List[float]
    z: List[float]


class CrossSection(BaseModel):
    data: List[float]
    shape: List[int]
    x: List[float]
    z: List[float]


class PlanView(BaseModel):
    data: List[float]
    shape: List[int]
    x: List[float]
    y: List[float]


class CrossSections(BaseModel):
    xz_plane: CrossSection
    xy_plane: PlanView


class MeltPoolMetrics(BaseModel):
    length_um: float
    width_um: float
    depth_um: float
    aspect_ratio: float
    cooling_rate_Ks: float
    G_Km: float
    R_ms: float
    G_over_R: float


class ComputeResponse(BaseModel):
    temperature_field: TemperatureField
    melt_pool: MeltPoolMetrics
    cross_sections: CrossSections
