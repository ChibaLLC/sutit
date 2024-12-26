export default defineEventHandler(async (event) => {
	const { user, token } = await useAuth(event);
	return {
		email: user.email,
		name: user.name,
		token: token,
		is_admin: false
	};
});
