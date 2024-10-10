"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function JoinRoom() {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const roomId = params.id as string;
    const storedData = localStorage.getItem(`pokerPlanning_${roomId}`);
    if (storedData) {
      const { name } = JSON.parse(storedData);
      if (name) {
        router.push(`/room/${roomId}`);
      }
    }
  }, [params.id, router]);

  const joinRoom = () => {
    if (userName.trim()) {
      setIsLoading(true);
      const roomId = params.id as string;
      const dataToStore = { name: userName.trim(), role: '' };
      localStorage.setItem(`pokerPlanning_${roomId}`, JSON.stringify(dataToStore));
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Join Planning Session</CardTitle>
          <CardDescription>Enter your name to join the room</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={joinRoom} className="w-full" disabled={isLoading || !userName.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Join Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}