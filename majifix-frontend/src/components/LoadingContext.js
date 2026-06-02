// import { createContext, useContext, useState } from 'react';

// const LoadingContext = createContext();

// export const LoadingProvider = ({ children }) => {
//   const [loadingCount, setLoadingCount] = useState(0);

//   const showLoading = () => {
//     setLoadingCount(prev => prev + 1);
//   };

//   const hideLoading = () => {
//     setLoadingCount(prev => Math.max(prev - 1, 0));
//   };

//   return (
//     <LoadingContext.Provider
//       value={{
//         loading: loadingCount > 0,
//         showLoading,
//         hideLoading
//       }}
//     >
//       {children}
//     </LoadingContext.Provider>
//   );
// };

// export const useLoading = () => useContext(LoadingContext);

import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);