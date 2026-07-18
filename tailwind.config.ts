import type { Config } from "tailwindcss";

const config: Config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "error": "#ba1a1a",
                        "surface-container-lowest": "#ffffff",
                        "surface-container-highest": "#dce2f3",
                        "inverse-on-surface": "#ebf1ff",
                        "error-container": "#ffdad6",
                        "surface-container-high": "#e2e8f8",
                        "secondary": "#5c5f61",
                        "primary-fixed-dim": "#7bd0ff",
                        "on-primary": "#ffffff",
                        "on-surface": "#151c27",
                        "on-surface-variant": "#3e484f",
                        "background": "#f9f9ff",
                        "surface-container-low": "#f0f3ff",
                        "tertiary-fixed-dim": "#c0c6db",
                        "on-tertiary-fixed-variant": "#404758",
                        "secondary-fixed-dim": "#c4c7c9",
                        "surface-bright": "#f9f9ff",
                        "secondary-container": "#e0e3e5",
                        "on-background": "#151c27",
                        "inverse-surface": "#2a313d",
                        "surface-container": "#e7eefe",
                        "outline": "#6e7980",
                        "inverse-primary": "#7bd0ff",
                        "on-secondary-container": "#626567",
                        "tertiary": "#575e70",
                        "on-primary-fixed": "#001e2c",
                        "surface-tint": "#00668a",
                        "on-primary-container": "#004965",
                        "on-tertiary": "#ffffff",
                        "on-tertiary-container": "#3d4455",
                        "on-error-container": "#93000a",
                        "surface": "#f9f9ff",
                        "surface-dim": "#d3daea",
                        "on-secondary-fixed": "#191c1e",
                        "primary-container": "#38bdf8",
                        "tertiary-container": "#aab1c5",
                        "primary-fixed": "#c4e7ff",
                        "tertiary-fixed": "#dce2f7",
                        "surface-variant": "#dce2f3",
                        "on-error": "#ffffff",
                        "outline-variant": "#bdc8d1",
                        "secondary-fixed": "#e0e3e5",
                        "on-secondary": "#ffffff",
                        "on-secondary-fixed-variant": "#444749",
                        "primary": "#00668a",
                        "on-tertiary-fixed": "#141b2b",
                        "on-primary-fixed-variant": "#004c69"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "section-gap": "64px",
                        "margin-desktop": "48px",
                        "stack-lg": "32px",
                        "container-max": "1280px",
                        "margin-mobile": "16px",
                        "unit": "4px",
                        "stack-md": "16px",
                        "stack-sm": "8px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "headline-md": [
                            "Hanken Grotesk"
                        ],
                        "label-caps": [
                            "Geist"
                        ],
                        "body-sm": [
                            "Inter"
                        ],
                        "display-lg-mobile": [
                            "Hanken Grotesk"
                        ],
                        "display-lg": [
                            "Hanken Grotesk"
                        ],
                        "body-md": [
                            "Inter"
                        ],
                        "mono-data": [
                            "Geist"
                        ],
                        "body-lg": [
                            "Inter"
                        ]
                    },
                    "fontSize": {
                        "headline-md": [
                            "24px",
                            {
                                "lineHeight": "1.3",
                                "letterSpacing": "-0.01em",
                                "fontWeight": "600"
                            }
                        ],
                        "label-caps": [
                            "12px",
                            {
                                "lineHeight": "1",
                                "letterSpacing": "0.05em",
                                "fontWeight": "600"
                            }
                        ],
                        "body-sm": [
                            "14px",
                            {
                                "lineHeight": "1.5",
                                "fontWeight": "400"
                            }
                        ],
                        "display-lg-mobile": [
                            "36px",
                            {
                                "lineHeight": "1.2",
                                "letterSpacing": "-0.02em",
                                "fontWeight": "700"
                            }
                        ],
                        "display-lg": [
                            "48px",
                            {
                                "lineHeight": "1.1",
                                "letterSpacing": "-0.02em",
                                "fontWeight": "700"
                            }
                        ],
                        "body-md": [
                            "16px",
                            {
                                "lineHeight": "1.5",
                                "fontWeight": "400"
                            }
                        ],
                        "mono-data": [
                            "14px",
                            {
                                "lineHeight": "1.4",
                                "fontWeight": "500"
                            }
                        ],
                        "body-lg": [
                            "18px",
                            {
                                "lineHeight": "1.6",
                                "fontWeight": "400"
                            }
                        ]
                    }
                },
            },
        } satisfies Config;
export default config;
