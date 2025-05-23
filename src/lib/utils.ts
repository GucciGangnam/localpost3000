import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get users geolocation 
export const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
      resolve(null);
      return null;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        resolve({ latitude, longitude });
      },
      // Error callback
      (error) => {
        console.log(`Unable to retrieve your location: ${error.message}`);
        resolve(null);
        return null;
      }
    );
  });
};
