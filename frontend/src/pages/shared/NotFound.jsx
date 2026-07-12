import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-xl p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange">404</p>
        <h1 className="mt-4 text-4xl font-black text-text">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-6">
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
