import { useEffect, useState } from 'react';
import { clearUser, getMeApi, refreshSessionApi, setUser } from '@entities/user';
import { clearAccessToken, setAccessToken } from '@shared/auth';
import { useAppDispatch } from '@shared/store';

export const useSessionRestore = (): { isRestoring: boolean } => {
  const dispatch = useAppDispatch();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restore = async (): Promise<void> => {
      try {
        const refreshed = await refreshSessionApi();
        if (cancelled) {
          return;
        }
        setAccessToken(refreshed.token);
        const me = await getMeApi();
        if (!cancelled) {
          dispatch(setUser(me.user));
        }
      } catch {
        if (!cancelled) {
          clearAccessToken();
          dispatch(clearUser());
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return { isRestoring };
};
