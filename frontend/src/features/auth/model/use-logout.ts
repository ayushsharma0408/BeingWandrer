import { useNavigate } from 'react-router-dom';
import { clearUser, logoutUserApi } from '@entities/user';
import { clearAccessToken } from '@shared/auth';
import { eventBus } from '@shared/kernel';
import { useAppDispatch } from '@shared/store';

export const useLogout = (redirectTo = '/'): (() => Promise<void>) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return async (): Promise<void> => {
    try {
      await logoutUserApi();
    } finally {
      clearAccessToken();
      dispatch(clearUser());
      eventBus.emit('auth:logout');
      navigate(redirectTo);
    }
  };
};
