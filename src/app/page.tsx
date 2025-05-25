'use client'
// IMPORTS 
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { NewspaperIcon, Calendar1, Speech, Tag, Gamepad2, TriangleAlert } from "lucide-react";
import { Ripple } from "@/components/magicui/ripple";
import Image from "next/image";
import { Switch } from "@/components/ui/switch"


import React, { useState } from 'react';



// TYPES


/// /// ///
export default function Root() {
  // States
  const [hasLocation, setHasLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const getLocation = () => {
    if (hasLocation) {
      setHasLocation(false)
      return
    }
    setHasLocation(true)
    console.log("getting location")
    setIsLoading(true);
    setError(null);

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      console.log('Geolocation is not supported by your browser')
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        setHasLocation(true)

        // You could also store these values in state if needed
        setIsLoading(false);
        console.log("loading finished")
      },



      // Error callback
      (error) => {
        setError(`Unable to retrieve your location: ${error.message}`);
        setHasLocation(false)
        setIsLoading(false);
        console.log(`Unable to retrieve your location: ${error.message}`)
      }
    );
  };



  return (
    <div id="page" className=" m-w-dvw h-dvh bg-background overflow-hidden">



      <div className="absolute w-full h-fit bg-background z-10 flex flex-col items-center gap-[2vh]">

        <div id="1" className="flex flex-col items-center gap-3 mt-5">
          <Image src={'/logo-96.png'} width={72} height={72} alt="Logo" />
          <p className="font-bold text-4xl">LocalPost3000</p>
        </div>

        <div id="2">
          <p className=" text-center text-muted-foreground">LocalPost requires your location to work. <br /> Your location isn’t used for anything other than finding posts near to you.</p>
        </div>

        <div id="3" className="flex flex-col items-center">
          <Switch
            checked={hasLocation}
            onCheckedChange={getLocation}
          />
        </div>



        {isLoading && <p className="text-muted-foreground">Working</p>}

          {error &&
            <div className="flex flex-col items-center">
              <TriangleAlert color="var(--destructive)" />
              <p className="text-muted-foreground text-center">{error}</p>
            </div>
          }



      </div>



      <div className="relative h-full mt-50 flex justify-center items-center">


        {/* Ripple */}
        <Ripple className="z-20 overflow-hidden" mainCircleOpacity={0.2} />
        {/* Orbiter - Absolute */}
        <OrbitingCircles path={false} radius={180} className="overflow-hidden top-[50%] left-[50%]">
          <NewspaperIcon color="var(--ring)" />
          <Calendar1 color="var(--ring)" />
          <Speech color="var(--ring)" />
        </OrbitingCircles>
        <OrbitingCircles path={false} radius={100} reverse className="overflow-hidden top-[calc(50%-10px)] left-[calc(50%-10px)]">
          <Tag color="var(--ring)" />
          <NewspaperIcon color="var(--ring)" />
          <Calendar1 color="var(--ring)" />
          <Gamepad2 color="var(--ring)" />
        </OrbitingCircles>

      </div>
    </div>
  )
}




