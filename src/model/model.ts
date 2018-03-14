export interface IOrganization {
    id: number;
    name: string;
}

export interface ICity {
    id: number;
    name: string;
    region: string;
}

export interface ICurator {
    id: number;
    email: string;
}

export interface IAttractionC {
    id: number;
    name: string;
    category: string;
    description: string;
    pciture: string;
    latitude: number;
    longitude: number;
    radius: number;
}
