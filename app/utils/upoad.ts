import { fileTypeFromBlob } from "file-type";
import { ulid } from "ulid";

export async function uploadFiles(items: Array<File | Blob | string>, root: string): Promise<string[]> {
	const formData = new FormData();
	const { user } = await useUser();

	for (const item of items) {
		let processedItem = item;

		if (typeof processedItem === "string") {
			try {
				const { blob } = await base64ToBlob(processedItem);
				if (!blob) {
					window.alertError("Unable to parse file");
					continue;
				}
				processedItem = blob;
			} catch (e) {
				log.error(e);
				continue;
			}
		}

		if (processedItem instanceof Blob) {
			const filename = ulid();
			processedItem = new File([processedItem], filename, {
				type: processedItem.type || (await fileTypeFromBlob(processedItem))?.mime || "",
			});
		}

		if (processedItem instanceof File) {
			formData.append(
				"file",
				processedItem,
				`${processedItem.name}.${inferFileExtentionFromMime(processedItem.type)}`
			);
		} else {
			log.error(
				"Strange data passed for upload; Should be: base64String | File | Blob. Received: ",
				processedItem
			);
		}
	}

	if ([...formData.keys()].length) {
		const urls = await $fetch<string[]>(`/files/${root}/`, {
			headers: {
				Authorization: `Bearer ${user.value.token}`,
			},
			method: "POST",
			body: formData,
		});
		return urls || [];
	}

	return [];
}

export async function uploadFile(file: File | Blob | string, root: string) {
	const urls = await uploadFiles([file], root);
	return urls.at(0);
}

export async function uploadStoreImages(data: SutitFormData) {
	const { user } = await useUser();
	const promises = Object.values(data.form.stores)
		.map((stores) =>
			stores.map((item) => {
				return item.images.map(async (image, index) => {
					// TODO: @blocked Uncomment once store images fix
					// const url = await uploadFile(image, user.value.email);
					// if (url) {
					// 	item.images[index] = url;
					// }
				});
			})
		)
		.flat(2);

	return Promise.all(promises);
}
