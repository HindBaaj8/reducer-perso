import { useDispatch } from 'react-redux';
import { logout } from '../features/Authslice';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login'); // redirection vers login
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Se déconnecter
    </button>
  );
};

export default LogoutButton;
