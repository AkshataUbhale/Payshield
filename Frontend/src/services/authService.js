export const login = async (walletAddress, role) => {
  // Mock API call for logging in
  console.log(`Logging in ${walletAddress} as ${role}`);
  return {
    success: true,
    user: {
      address: walletAddress,
      role: role,
    },
    token: 'mock-jwt-token'
  };
};

export const logout = async () => {
  // Mock API call for logging out
  console.log('Logging out');
  return { success: true };
};

export const checkAuth = async () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    return { success: true, user: JSON.parse(user) };
  }
  return { success: false };
};
