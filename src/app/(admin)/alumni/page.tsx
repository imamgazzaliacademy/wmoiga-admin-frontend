"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { useState } from "react";


export default function AlumniPage() {
  

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
            <Card className="w-full max-w-md text-center p-8 bg-white/50 backdrop-blur-sm border-dashed border-2">
                <CardContent className="flex flex-col items-center space-y-4 pt-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                        <Construction size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Coming Soon</h1>
                    <p className="text-gray-500">
                        The Alumni Management module is currently under development.
                        Check back later for updates.
                    </p>
                </CardContent>
            </Card>
        </div>
  );
}
