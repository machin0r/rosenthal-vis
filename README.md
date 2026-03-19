# Simple Rosenthal Melt Pool

Interactive visualisation of the Rosenthal analytical solution for laser powder bed fusion (L-PBF) melt pools. Adjust process parameters with sliders and see how the melt pool geometry, thermal gradients, and defect risk indicators respond in real time.

![Python](https://img.shields.io/badge/python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)

## What it does

- Solves the 3D Rosenthal moving point-source equation on a regular grid.
- Renders an isometric sketch of the melt pool.
- Computes melt pool dimensions (length, width, depth).
- Flags defect risks: **keyholing** (aspect ratio > 1.5), **lack of fusion** (pool smaller than layer/hatch), and **balling** (length/width > π)
- Ships with material presets for Ti-6Al-4V, 316L, IN718, AlSi10Mg, and CoCrMo

## Running locally

**Backend**:

```bash
cd backend
pip install -r ../pyproject.toml  # or: uv sync (from repo root)
uvicorn main:app --reload --port 8080
```

**Frontend** (Node 20+):

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies API requests to `localhost:8080`.

## Docker

```bash
docker build -t rosenthal-vis .
docker run -p 8080:8080 rosenthal-vis
```

Opens at `http://localhost:8080`. The single container builds the React frontend and serves it from FastAPI alongside the API.

## Limitations and assumptions

The Rosenthal equation is a useful first-order model, but it makes significant simplifying assumptions:

- **Point heat source** - the laser spot is treated as an infinitely small point. Real laser beams have a finite diameter (typically 50–100 µm) with a Gaussian or top-hat intensity profile. This causes the model to overpredict peak temperatures near the source.
- **Constant, isotropic thermal properties** - conductivity, diffusivity, and absorptivity are treated as fixed values. In reality they are temperature-dependent, and the powder bed has different effective properties from the bulk material (lower conductivity, different absorptivity).
- **No latent heat** - the energy absorbed/released during melting and solidification is ignored. This means thermal gradients and cooling rates near the liquidus are approximate.
- **Semi-infinite solid** - the substrate is modelled as infinitely deep and wide. Effects from part geometry, thin walls, overhangs, and previous layers are not captured.
- **Steady-state solution** - assumes the laser has been scanning long enough for the temperature field to reach a quasi-steady state in the moving reference frame. Transient effects at scan starts/stops and turning points are not modelled.
- **No fluid flow** - Marangoni convection and recoil pressure in the melt pool are ignored. These significantly affect pool shape in keyhole-mode melting, so the model is less reliable at high energy densities.
- **No vapourisation or plasma** - the model does not account for material evaporation, vapour depression (keyhole), or plasma/plume effects.
- **Defect thresholds are approximate** - the keyholing, lack-of-fusion, and balling criteria are simple geometric rules of thumb, not validated process maps for specific machines or powders.
