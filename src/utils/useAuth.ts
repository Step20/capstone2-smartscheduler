import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function useAuth() {
    const [uid, setUid] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUid(user ? user.uid : null);
        });
        return () => unsub();
    }, []);

    return uid;
}
