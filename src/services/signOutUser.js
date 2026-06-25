import { getAuth, signOut } from "firebase/auth";

function signOutUser(){
    const auth = getAuth();
    return(
        signOut(auth).then(() => {
            // Sign-out successful.
            // navigation
        }).catch((error) => {
            // An error happened.
        })  
    )
};

export default signOutUser;
