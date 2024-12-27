import { deleteUser } from "~~/server/api/users/utils/queries";

export default defineEventHandler(async (event) => {
	const { user } = await useAuth(event);
	return deleteUser(user.ulid);
});
