import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">LOSL-C Forms</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Dynamic form management system for LOSL-C
          </p>
          <Link href="/auth">
            <Button className="w-full">
              Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
