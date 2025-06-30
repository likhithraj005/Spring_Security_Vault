import React, { createContext, useEffect, useState } from "react";
import { AppConstants } from "../util/constants";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true; // Enable sending cookies with requests

    const BackendUrl = AppConstants.BackendUrl || 'http://localhost:8080/api/v1.0';
    console.log("Backend URL:", BackendUrl);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const getUserData = async () => {
        try {
            const response = await axios.get(BackendUrl + "/profile");
            console.log("User data response:", response);
            
            if (response.status === 200) {
                setUserData(response.data);
                setIsLoggedIn(true);
            } else {
                toast.error(response.data.message || "Failed to fetch user data");
                setUserData(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Error fetching user data");
            setUserData(null);
            setIsLoggedIn(false);
        }
    }


    const getAuthStatus = async () => {
        try {
            const response = await axios.get(BackendUrl + "/is-authenticated");
            console.log("Authentication status response:", response);

            if (response.status === 200 && response.data === true) {
                setIsLoggedIn(true);
                await getUserData();
            } else {
                setIsLoggedIn(false);
                setUserData(null);
                toast.warn("You are not authenticated. Please log in.");
            }

        } catch (error) {
            setIsLoggedIn(false);
            setUserData(null);

            if (error.response?.status === 401) {
                toast.warn("Session expired. Please log in again.");
            } else {
                console.error("Error checking authentication status:", error);
                toast.error("Something went wrong while checking authentication.");
            }
        }
    };

    useEffect(() => {
        // Check authentication status on initial load
        getAuthStatus();
    }, []);


    const contextValue = {
        BackendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData
    };

    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    );
};
