import { mediaApiRequest } from "@/apiRequest/media";
import { useMutation } from "@tanstack/react-query";

export const useUploadMediaMutation = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation({
    mutationFn: mediaApiRequest.upload,
  });
};
