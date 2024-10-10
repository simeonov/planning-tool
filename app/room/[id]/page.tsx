"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Users, Eye, Loader2 } from 'lucide-react';

interface User {
  name: string;
  role: string;
  vote: string | null;
}

const estimationValues = ['2', '3', '5', '8', '13'];

export default function Room() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [revealVotes, setRevealVotes] = useState<boolean>(false);
  const [roomLink, setRoomLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState({
    estimator: false,
    observer: false,
    reveal: false,
    reset: false,
    copyLink: false,
  });

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    setSocket(newSocket);

    const currentUrl = window.location.href;
    setRoomLink(currentUrl);

    newSocket.emit('joinRoom', {
      roomId: params.id,
      userName: searchParams.get('name'),
    });

    newSocket.on('updateUsers', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
      setIsLoading((prev) => ({ ...prev, estimator: false, observer: false }));
    });

    newSocket.on('revealVotes', () => {
      setRevealVotes(true);
      setIsLoading((prev) => ({ ...prev, reveal: false }));
    });

    newSocket.on('resetVotes', () => {
      setRevealVotes(false);
      setSelectedCard('');
      setIsLoading((prev) => ({ ...prev, reset: false }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [params.id, searchParams]);

  const selectRole = (role: string) => {
    setIsLoading((prev) => ({ ...prev, [role.toLowerCase()]: true }));
    setUserRole(role);
    socket?.emit('selectRole', { roomId: params.id, role });
  };

  const selectCard = (value: string) => {
    setSelectedCard(value);
    socket?.emit('vote', { roomId: params.id, vote: value });
  };

  const handleRevealVotes = () => {
    setIsLoading((prev) => ({ ...prev, reveal: true }));
    socket?.emit('revealVotes', { roomId: params.id });
  };

  const handleResetVotes = () => {
    setIsLoading((prev) => ({ ...prev, reset: true }));
    socket?.emit('resetVotes', { roomId: params.id });
  };

  const copyRoomLink = () => {
    setIsLoading((prev) => ({ ...prev, copyLink: true }));
    navigator.clipboard.writeText(roomLink).then(() => {
      toast.success('Room link copied to clipboard!');
      setIsLoading((prev) => ({ ...prev, copyLink: false }));
    });
  };

  const estimators = users.filter(user => user.role === 'Estimator');
  const observers = users.filter(user => user.role === 'Observer');

  const renderEstimator = (user: User, index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 280;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <div
        key={index}
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
        }}
      >
        <div className="flex flex-col items-center">
          <Avatar className="w-12 h-12 mb-2">
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name}</span>
          {revealVotes && user.vote && (
            <span className="mt-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
              {user.vote}
            </span>
          )}
          {!revealVotes && user.vote && (
            <span className="mt-1 w-6 h-6 bg-secondary rounded-full"></span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Room: {params.id}</h1>
        <div className="flex items-center space-x-2">
          <Input value={roomLink} readOnly className="w-64" />
          <Button onClick={copyRoomLink} disabled={isLoading.copyLink}>
            {isLoading.copyLink ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Copy Link
          </Button>
        </div>
      </div>

      {!userRole ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                onClick={() => selectRole('Estimator')} 
                className="flex-1"
                disabled={isLoading.estimator}
              >
                {isLoading.estimator ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                Estimator
              </Button>
              <Button 
                onClick={() => selectRole('Observer')} 
                className="flex-1"
                disabled={isLoading.observer}
              >
                {isLoading.observer ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Observer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative h-[700px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-64 bg-secondary rounded-lg flex items-center justify-center border-4 border-primary">
              {userRole === 'Estimator' && !revealVotes && (
                <div className="grid grid-cols-3 gap-2">
                  {estimationValues.map((value) => (
                    <Button
                      key={value}
                      variant={selectedCard === value ? "default" : "outline"}
                      className="w-16 h-24 rounded-lg flex items-center justify-center text-lg font-bold"
                      onClick={() => selectCard(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              )}
              {userRole === 'Observer' && (
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleRevealVotes}
                    disabled={!users.every(user => user.role === 'Observer' || user.vote) || isLoading.reveal}
                    className="w-32"
                  >
                    {isLoading.reveal ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Reveal Votes
                  </Button>
                  <Button 
                    onClick={handleResetVotes} 
                    className="w-32"
                    disabled={isLoading.reset}
                  >
                    {isLoading.reset ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    New Vote
                  </Button>
                </div>
              )}
            </div>
          </div>

          {estimators.map((user, index) => renderEstimator(user, index, estimators.length))}

          <div className="absolute top-0 right-0 bg-secondary p-4 rounded-lg border border-primary">
            <h2 className="font-bold mb-2">Observers</h2>
            <div className="flex flex-col space-y-2">
              {observers.map((user, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}