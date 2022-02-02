import React, { useEffect, useState } from "react";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import { useForm } from "react-hook-form";

export default function FileBucket() {
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    setError,
  } = useForm();

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size) {
          createdAt
          downloadURL
          id
          size
        }
      }
  `;

  const handleSave = async (formdata) => {
    const { matterId, s3ObjectKey, size } = formdata;

    const file = {
      matterId: matterId,
      s3ObjectKey: s3ObjectKey,
      size: parseInt(size),
    };

    console.log(file);
    await createMatterFile(file).then((u) => {
      console.log(u);
      setResultMessage(`Success!`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        reset({ size: "", matterId: "", s3ObjectKey: "" });
      }, 5000);
    });
  };

  async function createMatterFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mCreateMatterFile,
          variables: file,
        });

        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(handleSave)}>
      <div className="p-5 w-1/3" style={contentDiv}>
        <div className="relative flex-auto">
          <p className="input-name">Matter ID</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="Matter ID"
              {...register("matterId")}
            />
          </div>
        </div>

        <div className="relative flex-auto">
          <p className="input-name">S3 Object Key</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="S3 Object Key"
              {...register("s3ObjectKey")}
            />
          </div>
        </div>

        <div className="relative flex-auto">
          <p className="input-name">File Size</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="File Size"
              {...register("size")}
            />
          </div>
        </div>

        <div className="grid justify-start pt-5">
          <button className="save-btn" type="submit">
            <p>Save Changes</p>
          </button>
        </div>
      </div>

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </form>
  );
}
