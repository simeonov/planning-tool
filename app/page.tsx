"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function Home() {
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();

  const joinRoom = () => {
    if (userName.trim()) {
      const roomId = Math.random().toString(36).substring(7);
      router.push(`/room/${roomId}?name=${encodeURIComponent(userName.trim())}`);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Poker Planning</CardTitle>
          <CardDescription>Enter your name to join a planning session</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={joinRoom} className="w-full">Join Session</Button>
        </CardFooter>
      </Card>
    </div>
  );
}