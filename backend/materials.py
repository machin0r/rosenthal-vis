"""
Material preset data for common LPBF alloys.
All thermal values are at or near processing temperature (representative averages).
Liquidus temperatures in Kelvin, thermal conductivity in W/m·K, diffusivity in m²/s.
"""

MATERIALS = {
    "Ti-6Al-4V": {
        "conductivity": 6.7,  # W/m·K
        "diffusivity": 2.9e-6,  # m²/s  (2.9 mm²/s)
        "liquidus": 1928.15,  # K  (1655°C)
        "absorptivity": 0.35,
        "label": "Ti-6Al-4V",
        "description": "Titanium alloy, widely used in aerospace & medical",
    },
    "316L": {
        "conductivity": 14.6,
        "diffusivity": 3.9e-6,
        "liquidus": 1673.15,  # K  (1400°C)
        "absorptivity": 0.35,
        "label": "316L Stainless Steel",
        "description": "Austenitic stainless steel, excellent corrosion resistance",
    },
    "IN718": {
        "conductivity": 11.4,
        "diffusivity": 3.1e-6,
        "liquidus": 1609.15,  # K  (1336°C)
        "absorptivity": 0.30,
        "label": "IN718 (Inconel)",
        "description": "Nickel superalloy, high-temperature applications",
    },
    "AlSi10Mg": {
        "conductivity": 140.0,
        "diffusivity": 64.2e-6,
        "liquidus": 869.15,  # K  (596°C)
        "absorptivity": 0.15,
        "label": "AlSi10Mg",
        "description": "Aluminum alloy, lightweight automotive & aerospace",
    },
    "CoCrMo": {
        "conductivity": 13.0,
        "diffusivity": 3.5e-6,
        "liquidus": 1623.15,  # K  (1350°C)
        "absorptivity": 0.35,
        "label": "CoCrMo",
        "description": "Cobalt-chromium alloy, biomedical implants",
    },
}
