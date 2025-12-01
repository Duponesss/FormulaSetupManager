import { GameData } from "../stores/setupStore";

export const DEFAULT_GAME_DATA: GameData = {
    name: "F1 24",
    releaseYear: 2024,
    teams: [
        { teamName: "Oracle Red Bull Racing", carName: "Red Bull" },
        { teamName: "Scuderia Ferrari HP", carName: "Ferrari" },
        { teamName: "McLaren Formula 1 Team", carName: "McLaren" },
        { teamName: "Mercedes-AMG Petronas Formula One Team", carName: "Mercedes" },
        { teamName: "Aston Martin Aramco Formula One Team", carName: "Aston Martin" },
        { teamName: "BWT Alpine F1 Team", carName: "Alpine" },
        { teamName: "MoneyGram Haas F1 Team", carName: "Haas" },
        { teamName: "VISA Cash App RB F1 Team", carName: "RB" },
        { teamName: "Williams Racing", carName: "Williams" },
        { teamName: "Kick Sauber F1 Team", carName: "Sauber" }
    ],
    tracks: [
        "Bahrain", "Saudi Arabia", "Australia", "Japan", "China", "Miami", 
        "Emilia-Romagna", "Monaco", "Canada", "Spain", "Austria", "Great Britain", 
        "Hungary", "Belgium", "Netherlands", "Italy", "Azerbaijan", "Singapore", 
        "United States", "Mexico", "Brazil", "Las Vegas", "Qatar", "Abu Dhabi", 
        "Portugal", "China"
    ],
    validationRules: {
        aerodynamics: {
            frontWing: { min: 0, max: 50, step: 1 },
            rearWing: { min: 0, max: 50, step: 1 }
        },
        transmission: {
            diffAdjustmentOn: { min: 10, max: 100, step: 5 },
            diffAdjustmentOff: { min: 10, max: 100, step: 5 },
            engineBraking: { min: 0, max: 100, step: 10 }
        },
        suspensionGeometry: {
            frontCamber: { min: -3.5, max: -2.5, step: 0.1 },
            rearCamber: { min: -2.2, max: -0.7, step: 0.1 },
            frontToeOut: { min: 0.00, max: 0.50, step: 0.01 },
            rearToeIn: { min: 0.00, max: 0.50, step: 0.01 }
        },
        suspension: {
            frontSuspension: { min: 1, max: 41, step: 1 },
            rearSuspension: { min: 1, max: 41, step: 1 },
            frontAntiRollBar: { min: 1, max: 21, step: 1 },
            rearAntiRollBar: { min: 1, max: 21, step: 1 },
            frontRideHeight: { min: 10, max: 40, step: 1 },
            rearRideHeight: { min: 40, max: 100, step: 1 }
        },
        brakes: {
            brakePressure: { min: 80, max: 100, step: 1 },
            frontBrakeBias: { min: 50, max: 70, step: 1 }
        },
        tyres: {
            frontRightTyrePressure: { min: 22.5, max: 29.5, step: 0.1 },
            frontLeftTyrePressure: { min: 22.5, max: 29.5, step: 0.1 },
            rearRightTyrePressure: { min: 20.5, max: 26.5, step: 0.1 },
            rearLeftTyrePressure: { min: 20.5, max: 26.5, step: 0.1 }
        }
    }
};