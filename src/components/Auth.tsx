import { Helmet } from "react-helmet-async";
import { useSearchParams, Navigate } from "react-router-dom";
import { SecretContext, unlockSecret } from "../Security";
import { useContext } from "react";

export function Auth() {
    const [searchParams] = useSearchParams();
    const [secret, setSecret] = useContext(SecretContext);
    const pass = searchParams.get("pass");
    const redirect = searchParams.get("redirect") || "/";
    if (!secret && pass) {
        unlockSecret(pass, setSecret);
    }
    return <div>
        <Helmet>
            <meta name="robots" content="noindex" />
        </Helmet>
        <Navigate to={redirect} />
    </div>;
}