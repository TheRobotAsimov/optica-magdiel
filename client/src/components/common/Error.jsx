import NavComponent from './NavBar';

export default function Error({ message }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {message}</div>
        </div>
      </div>
    </div>
  );
}