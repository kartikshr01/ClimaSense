
/**
 * Fetches a human-readable address from geographic coordinates using the OpenStreetMap Nominatim API.
 * @param lat Latitude
 * @param lon Longitude
 * @returns A promise that resolves to a formatted address string.
 */
export const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch address from Nominatim API');
        }
        const data = await response.json();
        
        if (data && data.address) {
            // Construct a readable address. Prioritize city/town, then state, then country.
            const address = data.address;
            const city = address.city || address.town || address.village || address.hamlet;
            const state = address.state || address.state_district;
            const country = address.country;
            
            const parts = [city, state, country].filter(Boolean); // Filter out any undefined parts
            return parts.join(', ');
        } else {
            return "Unknown location";
        }
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        throw new Error("Could not determine address from coordinates.");
    }
};
