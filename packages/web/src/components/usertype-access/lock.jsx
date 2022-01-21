import React from "react";
import { useEffect, useState } from "react";
import { BsFillUnlockFill, BsLockFill } from "react-icons/bs";
export const LockAccess = ({
  feature_id,
  default_features,
  feature_access,
  row_index,
  user_type,
  lockChanged,
  switchIsTriggered,
}) => {
  const [isChecked, setIsChecked] = useState(true);
  const [isLockClicked, setIsLockClicked] = useState(false);

  const pageFeatureAccess = feature_access.find(
    (page) => page.id === default_features.id && page
  );

  // console.log("feature_access:", feature_access);
  // console.log("type => ", user_type);
  // console.log("find this => ", default_features);
  // console.log("pageFeatureAccess:", pageFeatureAccess);

  const featureIsFound =
    pageFeatureAccess !== undefined && pageFeatureAccess.features !== undefined
      ? pageFeatureAccess.features
          .map((pf) => pf.id)
          .find((feature) => feature === feature_id && feature)
      : undefined;

  const [accessPages, setAccessPages] = useState(feature_access);
  const [accessFeature, setAccessFeature] = useState(pageFeatureAccess);

  const [userType, setUserType] = useState(user_type);
  const activeSwitchStyle = {
    color: "#68d391",
    display: "inline",
  };

  const inactiveSwitchStyle = {
    color: "rgba(209, 213, 219, var(--tw-bg-opacity))",
    display: "inline",
  };

  const handleEvent = (event) => {
    /* Logging a message to the console. */
    console.log("Lock handleChange()");
    var newAccessFeatureSet, newAccessPageSet;
    // console.log("feature_id", feature_id);
    // console.log("accessPages", accessPages);
    // console.log("accessFeature", accessFeature);

    if (isChecked) {
      console.log(accessFeature);

      newAccessFeatureSet = accessFeature !== undefined ? accessFeature.features.filter(function (value) {
        return value.id !== feature_id;
      }) : undefined;
    } else {
      // newAccessPageSet = [
      //   ...accessPages,
      //   {
      //     id: default_access.id,
      //     features: default_access.features.map((f) => f.id),
      //   },
      // ];
    }
    //console.log("Access Page for `"+userType+"` ", newAccessPageSet);
    //setAccessPages(newAccessPageSet);

//    accessFeature.features = newAccessFeatureSet;
  //  console.log(accessFeature);
    // console.log("newFeatureSet", newAccessFeatureSet);
    // console.log("newAccessFeatureSet", accessFeature);

    // accessPages.map((p) => {
    //   if (p.id === accessFeature.id) {
    //     console.log("Page is match ", p.id, " = ", accessFeature.id);
    //     return accessFeature;
    //   } else {
    //     return p;
    //   }
    // });

    setIsChecked(!isChecked);
    setIsLockClicked(!isLockClicked);

    console.groupEnd();
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
  }, [accessPages, userType, isChecked, pageFeatureAccess, featureIsFound]);

  return isChecked ? (
    <BsFillUnlockFill
      size={21}
      style={activeSwitchStyle}
      onClick={handleEvent}
    />
  ) : (
    <BsLockFill size={21} style={inactiveSwitchStyle} onClick={handleEvent} />
  );
};
