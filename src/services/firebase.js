import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../services/secret";

// INITIALIZATIONS
const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

export const firestore = getFirestore(firebaseApp);

//FIREBASE AUTHENTICATION RELATED FUNCTIONS
export const signIn = async function (email, password) {
  await signInWithEmailAndPassword(firebaseAuth, email, password).catch((e) => {
    throw e;
  });
};

export const signUp = async function (email, password) {
  await createUserWithEmailAndPassword(firebaseAuth, email, password).catch(
    (e) => {
      throw e;
    }
  );
};

export const signOutRms = async function () {
  try {
    await signOut(firebaseAuth);
  } catch (e) {
    alert("Error: signOutRms");
  }
};

export const userExist = function () {
  return firebaseAuth.currentUser !== null;
};

export const currentUserEmail = function () {
  return firebaseAuth.currentUser.email;
};

//FIRESTORE RELATED DATA AND FUNCTIONS
async function generateCollegeID() {
  try {
    const availableIdRef = doc(firestore, "available-id", "id-number");
    const docSnap = await getDoc(availableIdRef);
    const collegeID = docSnap.data().id;
    await updateDoc(availableIdRef, { id: collegeID + 1 });
    return collegeID;
  } catch (e) {
    alert("Error: generateCollegeID");
  }
}

export const registerCollege = async function (adminEmail, college) {
  try {
    //Generate unique id for college
    const collegeID = await generateCollegeID();

    //Add admin's email to admin collection
    const adminRef = doc(firestore, "admin", adminEmail);
    await setDoc(adminRef, { "alloted-college-id": collegeID });

    //Add collegeId to college collection
    const collegeRef = doc(firestore, "college", collegeID.toString());
    await setDoc(collegeRef, { "college-name": college });
  } catch (e) {
    alert("Error: registerCollege");
  }
};

export const getCollegeID = async function (adminEmail) {
  try {
    const docRef = doc(firestore, "admin", adminEmail);
    const docSnap = await getDoc(docRef);
    return docSnap.data()["alloted-college-id"];
  } catch (e) {
    alert("Error: getCollegeID");
  }
};

export const getCollegeName = async function (collegeID) {
  try {
    const docRef = doc(firestore, "college", collegeID.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.data()["college-name"];
  } catch (e) {
    alert("Error: getCollegeName");
  }
};

export const createClass = async function (collegeID, className, subjects) {
  try {
    const docRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "classes",
      className
    );
    await setDoc(docRef, { "class-name": className, subjects: subjects });
  } catch (e) {
    alert("Error: createClass");
  }
};

export const isClassNameUnique = async function (className, collegeID) {
  try {
    const docRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "classes",
      className
    );
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  } catch (e) {
    alert("Error: isClassNameUnique");
  }
};

export const isUniqueRollNumber = async function (collegeID, rollNumber) {
  try {
    const docRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "students",
      rollNumber
    );
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  } catch (e) {
    alert("Error: isUniqueRollNumber");
  }
};

export const getSubjects = async function (className, collegeID) {
  try {
    const docRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "classes",
      className
    );
    const docSnap = await getDoc(docRef);
    const subjects = docSnap.data().subjects;
    return subjects;
  } catch (e) {
    alert("Error: getSubjects");
  }
};

export const addStudent = async function (
  className,
  collegeID,
  studentName,
  studentRollNumber,
  subjectsWithMarks
) {
  try {
    //Add student to college/collegeID/students
    const studentDocRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "students",
      studentRollNumber
    );

    await setDoc(studentDocRef, { "enrolled-class": className });

    //Add student subject details to college/collegeID/classes/className
    const studentDetailDocRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "classes",
      className,
      "enrolled-students",
      studentRollNumber
    );
    await setDoc(studentDetailDocRef, {
      "student-name": studentName,
      "student-roll-no": parseInt(studentRollNumber),
      "student-marks": subjectsWithMarks,
    });
  } catch (e) {
    alert("Error: addStudent");
  }
};

export const updateStudentDetails = async function (
  className,
  collegeID,
  studentName,
  studentRollNumber,
  subjectsWithMarks
) {
  try {
    console.log(
      className,
      collegeID,
      studentName,
      studentRollNumber,
      subjectsWithMarks
    );
    const studentDetailDocRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "classes",
      className,
      "enrolled-students",
      studentRollNumber.toString()
    );
    await updateDoc(studentDetailDocRef, {
      "student-name": studentName,
      "student-roll-no": studentRollNumber,
      "student-marks": subjectsWithMarks,
    });
  } catch (e) {
    alert("Error: updateStudent " + e.message);
  }
};

export const getResult = async function (collegeID, rollNumber) {
  try {
    const collegeName = await getCollegeName(collegeID);

    const studentDocRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "students",
      rollNumber.toString()
    );

    const className = (await getDoc(studentDocRef)).data()["enrolled-class"];

    const resultDocRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "classes",
      className,
      "enrolled-students",
      rollNumber.toString()
    );

    const resultSnap = await getDoc(resultDocRef);
    const result = resultSnap.data();

    return {
      collegeName: collegeName,
      className: className,
      studentName: result["student-name"],
      studentRollNumber: result["student-roll-no"],
      studentMarks: result["student-marks"],
    };
  } catch (e) {
    alert("Error: getResult");
  }
};

export const isValidCollegeID = async function (collegeID) {
  try {
    const docRef = doc(firestore, "college", collegeID.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (e) {
    alert("Error: isValidCollegeID");
  }
};

export const isValidRollNumber = async function (collegeID, rollNumber) {
  try {
    const docRef = doc(
      firestore,
      "college",
      collegeID.toString(),
      "students",
      rollNumber.toString()
    );
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (e) {
    alert("Error: isValidRollNumber");
  }
};
