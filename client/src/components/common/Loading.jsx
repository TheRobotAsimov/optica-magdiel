import NavComponent from './NavBar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <span className="text-xl font-medium text-gray-600">Cargando...</span>
        </div>
    </div>
  )
}
