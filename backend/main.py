import time
import base64

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import ComputeRequest, ComputeResponse, TemperatureField, MeltPoolMetrics, CrossSections, CrossSection, PlanView, DefectRisks
from rosenthal import PhysicsParams, compute_temperature_field, compute_metrics, compute_defect_risks, get_cross_sections
from materials import MATERIALS

app = FastAPI(
    title="LPBF Rosenthal API",
    description="Compute Rosenthal moving point-source temperature field for LPBF melt pool visualization.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/materials")
def get_materials():
    """Return the list of available material presets."""
    return {"materials": MATERIALS}


@app.post("/api/compute", response_model=ComputeResponse)
def compute(req: ComputeRequest):
    t0 = time.perf_counter()

    params = PhysicsParams(
        power=req.power,
        speed=req.speed,
        absorptivity=req.absorptivity,
        conductivity=req.conductivity,
        diffusivity=req.diffusivity,
        liquidus=req.liquidus,
        preheat=req.preheat,
    )

    try:
        T, x, y, z = compute_temperature_field(
            params,
            x_range=tuple(req.grid.x_range),
            y_range=tuple(req.grid.y_range),
            z_range=tuple(req.grid.z_range),
            resolution=req.grid.resolution,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Computation error: {e}")

    metrics = compute_metrics(T, x, y, z, params)
    defect_risks = compute_defect_risks(metrics, req.layer_thickness_um, req.hatch_spacing_um)
    T_xz, T_xy = get_cross_sections(T, x, y, z)

    elapsed_ms = (time.perf_counter() - t0) * 1000

    # Encode 3D field as float32 for efficient transfer
    # Flatten in C order: shape (nx, ny, nz) → row-major
    T_flat = T.astype(np.float32).flatten().tolist()

    return ComputeResponse(
        temperature_field=TemperatureField(
            data=T_flat,
            shape=list(T.shape),
            x=x.tolist(),
            y=y.tolist(),
            z=z.tolist(),
        ),
        melt_pool=MeltPoolMetrics(**metrics),
        defect_risks=DefectRisks(**defect_risks),
        cross_sections=CrossSections(
            xz_plane=CrossSection(
                data=T_xz.astype(np.float32).flatten().tolist(),
                shape=list(T_xz.shape),
                x=x.tolist(),
                z=z.tolist(),
            ),
            xy_plane=PlanView(
                data=T_xy.astype(np.float32).flatten().tolist(),
                shape=list(T_xy.shape),
                x=x.tolist(),
                y=y.tolist(),
            ),
        ),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
