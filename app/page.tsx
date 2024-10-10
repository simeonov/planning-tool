"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const createRoom = () => {
    if (userName.trim()) {
      setIsLoading(true);
      const roomId = Math.random().toString(36).substring(7);
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem(`pokerPlanning_${roomId}`, JSON.stringify({ name: userName.trim(), role: '' }));
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Poker Planning</CardTitle>
          <CardDescription>Create a new planning session</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={createRoom} className="w-full" disabled={isLoading || !userName.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}