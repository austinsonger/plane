"use client";

import { useEffect, useState } from "react";
// types
import { TIssue } from "@plane/types";
// ui
import { AlertModalCore, TOAST_TYPE, setToast } from "@plane/ui";
// constants
import { PROJECT_ERROR_MESSAGES } from "@/constants/project";
// hooks
import { useIssues, useProject } from "@/hooks/store";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  dataId?: string | null | undefined;
  data?: TIssue;
  isSubIssue?: boolean;
  onSubmit?: () => Promise<void>;
};

export const DeleteIssueModal: React.FC<Props> = (props) => {
  const { dataId, data, isOpen, handleClose, isSubIssue = false, onSubmit } = props;
  // states
  const [isDeleting, setIsDeleting] = useState(false);
  // store hooks
  const { issueMap } = useIssues();
  const { getProjectById } = useProject();

  useEffect(() => {
    setIsDeleting(false);
  }, [isOpen]);

  if (!dataId && !data) return null;

  // derived values
  const issue = data ? data : issueMap[dataId!];
  const projectDetails = getProjectById(issue?.project_id);

  const onClose = () => {
    setIsDeleting(false);
    handleClose();
  };

  const handleIssueDelete = async () => {
    setIsDeleting(true);
    if (onSubmit)
      await onSubmit()
        .then(() => {
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Success!",
            message: `${isSubIssue ? "Sub-issue" : "Issue"} deleted successfully`,
          });
          onClose();
        })
        .catch((errors) => {
          const isPermissionError = errors?.error === "Only admin or creator can delete the issue";
          const currentError = isPermissionError
            ? PROJECT_ERROR_MESSAGES.permissionError
            : PROJECT_ERROR_MESSAGES.issueDeleteError;
          setToast({
            title: currentError.title,
            type: TOAST_TYPE.ERROR,
            message: currentError.message,
          });
        })
        .finally(() => onClose());
  };

  return (
    <AlertModalCore
      handleClose={onClose}
      handleSubmit={handleIssueDelete}
      isSubmitting={isDeleting}
      isOpen={isOpen}
      title="Delete Issue"
      content={
        <>
          Are you sure you want to delete issue{" "}
          <span className="break-words font-medium text-custom-text-100">
            {projectDetails?.identifier}-{issue?.sequence_id}
          </span>
          {""}? All of the data related to the issue will be permanently removed. This action cannot be undone.
        </>
      }
    />
  );
};
