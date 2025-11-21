import NavComponent from './NavBar';
import { useNavigate } from 'react-router';

export default function Error({ message }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h3 className="font-bold text-red-900">Error</h3>
          <p className="text-red-700">{message}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-red-700 underline">Volver</button>
        </div>
    </div>
  );
}