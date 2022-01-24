import React from "react";
import { useEffect, useState } from "react";
import { BsFillUnlockFill, BsLockFill } from "react-icons/bs";
export const LockAccess = ({
  feature_id,
  default_features,
  feature_access,
  user_type,
  lockChanged,
  switchIsTriggered,
}) => {
  const activeSwitchStyle = {
    color: "#68d391",
    display: "inline",
  };

  const inactiveSwitchStyle = {
    color: "rgba(209, 213, 219, var(--tw-bg-opacity))",
    display: "inline",
  };

  const [isChecked, setIsChecked] = useState(true);
  const [isLockClicked, setIsLockClicked] = useState(false);
  const pageFeatureAccess = feature_access.find(
    (page) => page.id === default_features.id && page
  );
  const featureIsFound =
    pageFeatureAccess !== undefined && pageFeatureAccess.features !== undefined
      ? pageFeatureAccess.features
          .map((pf) => pf.id)
          .find((feature) => feature === feature_id && feature)
      : undefined;
  const [accessFeature, setAccessFeature] = useState(pageFeatureAccess);
  const [userType, setUserType] = useState(user_type);

  const handleEvent = () => {
    var newAccessFeatureSet;

    if (isChecked) {
      newAccessFeatureSet =
        accessFeature !== undefined &&
        accessFeature.features.filter(function (value) {
          return value.id !== feature_id;
        });
    } else {
      newAccessFeatureSet = [
        ...accessFeature.features,
        {
          id: feature_id,
        },
      ];
    }

    accessFeature.features =
      newAccessFeatureSet !== undefined && newAccessFeatureSet;

    setIsChecked(!isChecked);
    setIsLockClicked(!isLockClicked);
  };

  useEffect(() => {
    if (!isLockClicked) {
      if (switchIsTriggered != null) {
        const { page_id, is_checked } = switchIsTriggered;

        if (pageFeatureAccess !== undefined) {
          setIsLockClicked(false);

          if (page_id === pageFeatureAccess.id) {
            setIsChecked(is_checked);
          }
        } else {
          setIsChecked(featureIsFound !== undefined);
        }
      } else {
        setIsChecked(featureIsFound !== undefined);
      }
    } else {
      setIsLockClicked(false);
    }

    lockChanged(accessFeature, userType);
  }, [userType, isChecked, pageFeatureAccess, featureIsFound]);

  return isChecked ? (
    <BsFillUnlockFill size={21} style={activeSwitchStyle} onClick={handleEvent} />
  ) : (
    <BsLockFill size={21} style={inactiveSwitchStyle} onClick={handleEvent} />
  );
};
