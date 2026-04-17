MOCK_EXTRACTIONS = {
    "11": {
        "major_equipment": [
            {
                "tag": "V-101",
                "name": "Test Separator",
                "type": "Horizontal Three-Phase Separator",
                "upstream_equipment": "Test Header",
                "downstream_equipment": "Oil Export Line / Gas Flare",
                "operating_parameters": "1450 PSIG, 120 F",
                "design_parameters": "1650 PSIG, 250 F",
                "size": "48\" ID x 15' S/S"
            }
        ],
        "instruments_causes": [
            {
                "tag": "LT-101",
                "type": "Level Transmitter",
                "description": "Separator Liquid Level Control",
                "associated_equipment": "V-101",
                "position": "Vessel Side",
                "line_tag": "3\"-L-101",
                "line_service": "Produced Water / Oil",
                "fail_position": "Last Position",
                "destination_or_source": "Water Treatment"
            },
            {
                "tag": "PT-101",
                "type": "Pressure Transmitter",
                "description": "Vessel Pressure Monitoring",
                "associated_equipment": "V-101",
                "position": "Top of Vessel",
                "line_tag": "4\"-G-101",
                "line_service": "Natural Gas",
                "fail_position": "High",
                "destination_or_source": "Flare"
            }
        ],
        "safety_devices": [
            {
                "tag": "PSV-101",
                "type": "Pressure Safety Valve",
                "description": "Vessel Overpressure Protection",
                "associated_equipment": "V-101",
                "setpoint": "1650 PSIG",
                "destination": "HP Flare",
                "line_service": "Gas"
            }
        ]
    },
    "15": {
        "major_equipment": [
            {
                "tag": "V-202",
                "name": "IP Production Separator",
                "type": "IP Three-Phase Separator",
                "upstream_equipment": "Production Header",
                "downstream_equipment": "LP Separator / Gas Compression",
                "operating_parameters": "850 PSIG, 110 F",
                "design_parameters": "1100 PSIG, 200 F",
                "size": "72\" ID x 24' S/S"
            }
        ],
        "instruments_causes": [
            {
                "tag": "LC-202",
                "type": "Level Controller",
                "description": "IP Separator Liquid Interface Control",
                "associated_equipment": "V-202",
                "position": "Outlet line",
                "line_tag": "6\"-L-202",
                "line_service": "Emulsion",
                "fail_position": "Open",
                "destination_or_source": "LP Separator"
            }
        ],
        "safety_devices": [
            {
                "tag": "LSHH-202",
                "type": "Level Switch High High",
                "description": "High Liquid Level Shutdown",
                "associated_equipment": "V-202",
                "setpoint": "90%",
                "destination": "ESD Logic",
                "line_service": "Liquid"
            }
        ]
    },
    "28": {
        "major_equipment": [
            {
                "tag": "K-303",
                "name": "FGC No. 1 3rd Stage Compressor",
                "type": "Centrifugal Compressor",
                "upstream_equipment": "3rd Stage Suction Header",
                "downstream_equipment": "Aftercooler / Export Pipeline",
                "operating_parameters": "2200 PSIG Discharge, 140 F",
                "design_parameters": "2850 PSIG, 300 F",
                "size": "15000 HP"
            }
        ],
        "instruments_causes": [
            {
                "tag": "PT-303",
                "type": "Pressure Transmitter",
                "description": "3rd Stage Discharge Pressure",
                "associated_equipment": "K-303",
                "position": "Discharge piping",
                "line_tag": "12\"-G-303",
                "line_service": "Gas",
                "fail_position": "Low",
                "destination_or_source": "Export Line"
            }
        ],
        "safety_devices": [
            {
                "tag": "SCV-303",
                "type": "Surge Control Valve",
                "description": "Compressor Surge Protection",
                "associated_equipment": "K-303",
                "setpoint": "Surge Curve",
                "destination": "Suction Scrubber",
                "line_service": "Recycle Gas"
            }
        ]
    }
}

MOCK_CAUSES = {
    "High Pressure": [
        "Failure of Pressure Controller PT-101 resulting in gas outlet valve closing.",
        "Blockage in the downstream flare line header.",
        "Inadvertent closure of manual isolation valve on the gas outlet.",
        "Sudden surge in production flow from upstream wellhead manifolds."
    ],
    "Low Pressure": [
        "Failure of gas outlet control valve in open position.",
        "Rupture or significant leak in the vessel shell or piping.",
        "Failure of upstream production flow resulting in loss of pressure."
    ],
    "High Flow": [
        "Downstream demand increase resulting in valve opening.",
        "Tube leak in heat exchanger resulting in cross-flow.",
        "Control valve failure at 100% open position."
    ],
    "Low Flow": [
        "Pump failure or compressor trip.",
        "Stuck closed control valve or check valve.",
        "Upstream vessel level empty causing loss of prime."
    ],
    "High Temperature": [
        "Cooling medium failure on upstream heat exchanger.",
        "External fire impacting the vessel shell.",
        "Bypass of thermal control system."
    ],
    "Low Temperature": [
        "Joule-Thomson cooling due to significant pressure drop through a valve.",
        "Exposure to ambient conditions during winter shutdown.",
        "Failure of heating medium on separator internals."
    ]
}

MOCK_WORKSHEET = {
    "design_pressure": 1650,
    "included_rows": [
        {
            "number": "1.1",
            "category": "PAF",
            "cause": "High Pressure caused by PT-101 failing high causing gas outlet valve to close",
            "intermediate_consequence": "Vessel pressure increases to flare setpoint. Potential for overpressure if PSV fails.",
            "scenario_comments": ["Probability of simultaneous failure is low.", "Impact localized to separator area."],
            "pec": "NO",
            "mitigation_bullets": ["PSV-101 sized for full blockage", "Independent high pressure alarm"],
            "risk_c": 3,
            "risk_p": 2,
            "risk_level": "B"
        },
        {
            "number": "1.2",
            "category": "PD/LOR",
            "cause": "High Pressure resulting in process trip and shutdown",
            "intermediate_consequence": "Sudden loss of production platform-wide.",
            "scenario_comments": ["Estimated 12 hours downtime for reset and restart."],
            "pec": "NO",
            "mitigation_bullets": ["Early warning system", "Operator intervention"],
            "risk_c": 4,
            "risk_p": 1,
            "risk_level": "C"
        }
    ],
    "excluded_causes": [
        {
            "cause": "Minor fluctuations in feed rate",
            "line_type": "Production",
            "max_pressure": 1500,
            "ratio": 0.9,
            "rationale": "Below design pressure limit."
        }
    ],
    "cross_referenced_causes": []
}
