import { ActionCodeSettings, Auth, AuthErrorCodes, EmailAuthProvider, getAuth, isSignInWithEmailLink, linkWithCredential, sendSignInLinkToEmail, signInWithCredential, signInWithEmailLink, User } from "firebase/auth";





export function sendSignInLink(auth: Auth, emailAddress: string, actionCodeSettings: ActionCodeSettings, onSuccess: () => void, onFailure: (errorCode: string) => void) {
    sendSignInLinkToEmail(auth, emailAddress, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', emailAddress);
            onSuccess()
        })
        .catch((error) => {
            const errorCode = error.code;
            onFailure(errorCode)
        });
}

export function sendSignUpLink(auth: Auth, emailAddress: string, actionCodeSettings: ActionCodeSettings, onSuccess: () => void, onFailure: (errorCode: string) => void) {
    sendSignInLinkToEmail(auth, emailAddress, actionCodeSettings)
        .then(() => {
            // The link was successfully sent. Inform the user.
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            window.localStorage.setItem('emailForSignUp', emailAddress);
            onSuccess()
        })
        .catch((error) => {
            const errorCode = error.code;
            //const errorMessage = error.message;
            onFailure(errorCode)
        });
}

export function completeEmailSignUp(auth: Auth, anonymousUser: User) {
    // Asynchronously handle email link sign up

    // Confirm the link is a sign-in with email link.
    const emailLink = window.location.href
    if (isSignInWithEmailLink(auth, emailLink)) {
        let email = window.localStorage.getItem('emailForSignUp');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation', " ");
        }

        const authCredential = EmailAuthProvider.credentialWithLink(email!, emailLink);
        if (!anonymousUser.email) {
            // If the current user hasn't already been linked to an email, try and link them to this one.
            // The anonymous user could already have an email if the login was persisted from a previous session.
            linkWithCredential(anonymousUser, authCredential)
                .then((_) => {
                    console.log("Linked email with UUID")
                    window.localStorage.removeItem('emailForSignUp');
                    redirectToHomepage()
                    return true
                })
                .catch((error) => {
                    switch (error.code) {
                        case AuthErrorCodes.EMAIL_EXISTS:
                            // The email address is already associated with an account, so try to sign in to that account
                            console.log("Given email address has existing account. Attempting to sign in.")
                            signInWithCredential(auth, authCredential).then((_) => {
                                console.log("Sign in successful")
                                redirectToHomepage()
                            }).catch((signInError) => {
                                console.log("Sign in failed")
                                console.log(signInError)
                                redirectToHomepage()
                            })
                            break;
                        case AuthErrorCodes.PROVIDER_ALREADY_LINKED:
                            console.log("Authenticated user already has linked email address. No need to sign in with email again.")
                            redirectToHomepage()
                            break;
                        default:
                            // Some error occurred.
                            console.log("Failed to link email with UUID")
                            console.log(error)
                            redirectToHomepage()
                            break;
                    }

                });
        } else {
            // If the current user has an email address, but it differs from that of the sign-in link

            signInWithCredential(auth, authCredential).then((_) => {
                console.log("Sign in successful")
                redirectToHomepage()
            }).catch((signInError) => {
                console.log("Sign in failed")
                console.log(signInError)
                redirectToHomepage()
            })
        }
    }
}

export function completeEmailSignIn(auth: Auth) {
    // Confirm the link is a sign-in with email link.
    const emailLink = window.location.href
    if (isSignInWithEmailLink(auth, emailLink)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation', " ");
        }

        const authCredential = EmailAuthProvider.credentialWithLink(email!, emailLink);
        signInWithCredential(auth, authCredential).then((_) => {
            console.log("Sign in successful")
            redirectToHomepage()
        }).catch((signInError) => {
            console.log("Sign in failed")
            console.log(signInError)
            redirectToHomepage()
        })
    }
}

export async function signOutAndRestart() {
    const auth = getAuth();
    await auth.signOut().then((_) => {
        redirectToHomepage()
    }
    )
}

export async function redirectToHomepage(){
    window.location.href = "/"
}