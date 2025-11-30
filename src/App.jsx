import './styles/style.css';
import Admin from './pages/Admin.jsx';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import { Routes, Route} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Blogs from './pages/Blogs';
import Carrito from './pages/Carrito';
import Contacto from './pages/Contacto';
import Dato1 from './pages/Dato1';
import Dato2 from './pages/Dato2';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Registro from './pages/Registro';
import { useLocation } from 'react-router-dom';
import AdminUsuarios from './pages/Admin-usuarios.jsx';
import AdminProductos from './pages/Admin-productos.jsx';
import Ofertas from './pages/Ofertas.jsx';
import Checkout from './pages/Checkout.jsx';
import PagoBien from './pages/Pago-bien.jsx';
import PagoMal from './pages/Pago-mal.jsx';
import AdminBoletas from './pages/Admin-Boletas.jsx';
import AdminProductosCriticos from './pages/Admin-productos-criticos.jsx';
import AdminReportes from './pages/Admin-reportes.jsx';
import AdminPerfil from './pages/Admin-perfil.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';


function App() {
  const location = useLocation();
  // Modificamos la lógica para incluir también la ruta admin-usuarios
  const hideLayout = ['/admin', '/admin-usuarios','/admin-productos','/admin-boletas','/admin-productos-criticos','/admin-reportes','/admin-perfil'].includes(location.pathname);

  return (
    <div className="App">
      {!hideLayout && <Header/>}
      <Routes>
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
        <Route path="/admin-usuarios" element={<ProtectedRoute requireAdmin={true}><AdminUsuarios /></ProtectedRoute>} />
        <Route path="/admin-productos" element={<ProtectedRoute requireAdmin={true}><AdminProductos /></ProtectedRoute>} />
        <Route path="/admin-boletas" element={<ProtectedRoute requireAdmin={true}><AdminBoletas /></ProtectedRoute>} />
        <Route path="/admin-productos-criticos" element={<ProtectedRoute requireAdmin={true}><AdminProductosCriticos /></ProtectedRoute>} />
        <Route path="/admin-reportes" element={<ProtectedRoute requireAdmin={true}><AdminReportes /></ProtectedRoute>} />
        <Route path="/admin-perfil" element={<ProtectedRoute requireAdmin={true}><AdminPerfil /></ProtectedRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blogs" element={<Blogs/>} />
        <Route path="/ofertas" element={<Ofertas/>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>} />
        <Route path="/pago-bien" element={<ProtectedRoute><PagoBien/></ProtectedRoute>} />
        <Route path="/pago-mal" element={<ProtectedRoute><PagoMal/></ProtectedRoute>} />
        <Route path='/carrito' element={<ProtectedRoute><Carrito/></ProtectedRoute>} />
        <Route path="/contacto" element={<Contacto/>} />
        <Route path="/dato1" element={<Dato1/>} />
        <Route path="/dato2" element={<Dato2/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/productos" element={<Productos/>} />
        <Route path="/registro" element={<Registro/>} />
        <Route path="/products-page" element={<ProductsPage/>} />
      </Routes>
      {!hideLayout && <Footer/>}
    </div>
  );
}

export default App;
