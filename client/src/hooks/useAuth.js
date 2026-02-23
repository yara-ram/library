import { useEffect, useState } from "react";
import { api } from "../api";

export function useAuth() {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((data) => {
        if (!alive) return;
        setState({ loading: false, user: data.user });
      })
      .catch(() => {
        if (!alive) return;
        setState({ loading: false, user: null });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

