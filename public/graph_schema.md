{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Nodges Graph Data Schema",
    "type": "object",
    "required": [
        "system",
        "metadata",
        "data"
    ],
    "properties": {
        "system": {
            "type": "string",
            "description": "Name of the graph system or project"
        },
        "metadata": {
            "type": "object",
            "properties": {
                "created": {
                    "type": "string",
                    "format": "date-time"
                },
                "version": {
                    "type": "string"
                },
                "author": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                }
            },
            "additionalProperties": true
        },
        "dataModel": {
            "type": "object",
            "properties": {
                "entities": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "object",
                        "properties": {
                            "properties": {
                                "type": "object",
                                "additionalProperties": {
                                    "type": "object",
                                    "required": [
                                        "type"
                                    ],
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "continuous",
                                                "categorical",
                                                "vector",
                                                "spatial",
                                                "temporal"
                                            ]
                                        },
                                        "range": {
                                            "type": "array",
                                            "items": {
                                                "type": "number"
                                            },
                                            "minItems": 2,
                                            "maxItems": 2
                                        },
                                        "unit": {
                                            "type": "string"
                                        },
                                        "dimensions": {
                                            "type": "array",
                                            "items": {
                                                "type": "string"
                                            }
                                        },
                                        "values": {
                                            "type": "array",
                                            "items": {
                                                "type": "string"
                                            }
                                        },
                                        "coordinates": {
                                            "type": "array",
                                            "items": {
                                                "type": "string"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "relationships": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "object",
                        "properties": {
                            "properties": {
                                "type": "object",
                                "additionalProperties": {
                                    "type": "object",
                                    "required": [
                                        "type"
                                    ],
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "continuous",
                                                "categorical",
                                                "vector",
                                                "spatial",
                                                "temporal"
                                            ]
                                        },
                                        "range": {
                                            "type": "array",
                                            "items": {
                                                "type": "number"
                                            },
                                            "minItems": 2,
                                            "maxItems": 2
                                        },
                                        "unit": {
                                            "type": "string"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "visualMappings": {
            "type": "object",
            "properties": {
                "defaultPresets": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "object",
                        "additionalProperties": {
                            "type": "object",
                            "required": [
                                "source",
                                "function"
                            ],
                            "properties": {
                                "source": {
                                    "type": "string"
                                },
                                "function": {
                                    "type": "string",
                                    "enum": [
                                        "linear",
                                        "exponential",
                                        "logarithmic",
                                        "heatmap",
                                        "bipolar",
                                        "pulse",
                                        "geographic",
                                        "sphereComplexity"
                                    ]
                                },
                                "range": {
                                    "type": "array",
                                    "items": {
                                        "type": "number"
                                    },
                                    "minItems": 2,
                                    "maxItems": 2
                                },
                                "palette": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "data": {
            "type": "object",
            "required": [
                "entities",
                "relationships"
            ],
            "properties": {
                "entities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "id",
                            "type"
                        ],
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "type": {
                                "type": "string"
                            },
                            "label": {
                                "type": "string"
                            },
                            "position": {
                                "type": "object",
                                "properties": {
                                    "x": {
                                        "type": "number"
                                    },
                                    "y": {
                                        "type": "number"
                                    },
                                    "z": {
                                        "type": "number"
                                    }
                                },
                                "required": [
                                    "x",
                                    "y",
                                    "z"
                                ]
                            }
                        },
                        "additionalProperties": true
                    }
                },
                "relationships": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "type",
                            "source",
                            "target"
                        ],
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "type": {
                                "type": "string"
                            },
                            "source": {
                                "type": "string"
                            },
                            "target": {
                                "type": "string"
                            },
                            "label": {
                                "type": "string"
                            }
                        },
                        "additionalProperties": true
                    }
                }
            }
        }
    }
}