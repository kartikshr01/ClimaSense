export interface LocationDateInput {
    location: string;
    date: string;
}

export interface ComfortInput {
    temp: number;
    humidity: number;
    wind: number;
    rain: number;
}

export interface ComfortData {
    source: string;
    location: string;
    date: string;
    input: ComfortInput;
    comfort: string;
    summary: string;
    recommendation: string;
}