/* eslint-disable no-console */
const httpStatus = require('http-status');

const successMessage = {
    TEMPLATE_ADDED_SUCCESSFULLY:"TEMPLATE_ADDED_SUCCESSFULLY",
    DLT_ID_SENT_TO_THE_SUPER_ADMIN:" ID has been sent to the admin for approval",
    // DLT_WHATSAPP_ID_SENT_TO_THE_SUPER_ADMIN:"Whatsapp ID has been sent to the admin for approval",
    SIGNUP_SUCCESSFUL: 'User registered successfully',
    CONTACT_ADDED:"CONTACT_ADDED",
    FETCH_DATA:"Fetch data Successfully",
    GROUP_ADDED:"GROUP_ADDED",
    GROUP_DATA_ADDED:"GROUP_DATA_ADDED",
    FAILED_TO_ADD_DATA:" FAILED_TO_ADD_DATA",
    LOGIN_SUCCESSFUL: 'User logged in successfully',
    USER_REGISTERED_LOGIN: 'User registered successfully.',
    API_SUCCESS: 'Success',
    LOGOUT_SUCCESSFUL: 'User logged out successfully',
    PASSWORD_UPDATED: 'Password has been Updated!',
    FORGOT_PASSWORD: 'Reset link Sent on your mail',
    NOT_MATCHED: 'Not Matched Yet',
    DELETED: 'Deleted successfully.',
    OTP_SENT: 'Otp sent successfully',
    EMAIL_SENT :"Email sent successfully",
    EMAIL_VERIFIED: 'Email successfully verified ',
    UPDATE_EMAIL: 'Email update successfully',
    PROFILE_PIC_UPDATE :"Profile picture updated ",
    NOTICE_CREATE :"Notice create successfully",
    PLAN_UPDATE:"This plan has been update",
    PLAN_DELETE:"This plan has been deleted",
    SET_STATUS:"Status set Successfully",
    GET_NOTICE : 'All notice',
    TAG_DELETE:"tag Delete Successfully from Document",
    PLAN_NOT_FOUND:"Expire Plan",
    P_UPDATE:"update Successfull",
    G_NOT_FOUND:"Group not found",
    RULES_ADDED:"rules created",
    SUB_USER_CREATE:"Subuser Create sucessfully",
    ADD_CATEGORY:"Category Add Successfull",
    VALIDATION_ERROR:"Input value does not match the validation/condition",
    CHANGE_STATUS:"status change successfully",
    PAYMENT_SUCCESSFUL:"Payment done sucessful",

};


const errorMessage = {
    DOB_VALIDATION_FAILED:"Dob validation failed",
    VERIFY_ID_ERROR: 'Error in approved verifyId.',
    NOT_FOUND:"Data not found",
    AUDIO_FILE_REQUIRE:"Audio file not exists",
    TEMPLATE_NOT_FOUND:"TEMPLATE_NOT_FOUND",
    Data_NOT_FOUND:"Data not found",
    USER_NOT_FOUND:"User not found",
    FAILED_TO_FATCH_DATA:"FAILED_TO_FATCH_DATA",
    TOKEN_EXPIRED: 'Token Expired ',
    ALREADY_REGISTERED: 'An account has already been created.',
    REG_ALREADY_REGISTERED: 'An account has already been created with this registration number.',
    UPDATE_ERROR: 'Error in updating data.',
    API_ERROR: 'Error in Api Execution.',
    Email_AND_PHONE_EXIST:'Email AND PHONE NUMBER ALREADY EXIST',
    VALIDATION_ERROR: 'Validation error.',
    FAILED_TO_ADD: 'Failed to Add Data.',
    INVALID_CREDENTIALS: 'Invalid Credentials',
    EMAIL_FAILURE: 'Email not sent.',
    ID_FAILURE :"Id not sent",
    DLT_SMS: 'DLT_SMS not sent.',
    DLT_WHATSAPP: 'DLT_WHATSAPP not sent.',
    EMAIL_ALREADY_EXISTS: 'Email already exists.',
    NOTICE_NOT_FOUND: 'Notice Not Found',
    UNAUTHORIZED: 'User Not Authorized',
    FAILED_TO_EDIT: "You can't edit some fields because you have matched with someone.",
    FAILED_TO_UPDATE: "Failed to Update.",
    FAILED_TO_DELETE: 'Failed to Delete Data.',
    FAILED_TO_GET_ROOM: 'Failed to get room id.',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INVALID_EMAIL: 'invalid email id',
    INVALID_OTP: 'invalid otp',
    SIGNUP_FAILED: 'Your signUp failed',
    EMAIL_NOT_VERIFIED: 'Email is not verified',
    INVALID_TOKEN: 'Your token is invalid.',
    EMAIL_v_FAILED: 'Email verification is failed',
    MISSING_TOKEN: 'Missing token',
    MISSING_P: 'Missing parameter',
    OTP_NOT_SEND: 'Otp not send successfully',
    OTP_EXPIRED: 'Otp has expired',
    NOT_TOKEN:"You can't give any token",
    PASSWORD_MISS_MATCH: 'Password and confirm password are not same. Please retry',
    INCORRECT_PASSWORD:"Incorrect Password",
    ALREADY_VERIFY:"Email already verify",
    SAME_PLAN:"Same plan  exist",
    PLAN_NOT_FOUND:"Plan not found",
    OTP_v_FAILED: 'Please Verify Your OTP',
    IN_ACTIVE_STATUS:"Status In-Active",
    RESEND_OTP:"OTP SEND SUCCESSFULLY",
    PLAN_ALREAY_SELECTED:"plan already selected please upgrade your plan",
    PLAN_SELECT:"plane Activate successfully",
    PLAN_UPGRADE:"plan upgrade successfull",
    TAG_NOT_FOUND:"Tag not found",
    DUPLICATE:"Duplicate Data ",
    USER_NOT_FOUND:"User is not found"  ,
    GROUP_NOT_FOUND:"group not Found",
    USER_NOT_FOUND:"User is not found" ,
    COLUMN_NOT_MATCH:"MaximumLength not match",
    VALIDATION:"validation Not Match",
    DATA_TYPE:"dataType Not Match",
    EXCEL_FILE_EXISTS:"Cant Add Excel file Already Exists Please Update",
    PASSWORD_MISS_MATCH:"Password Miss Match",
    OLD_NEW_PASSWORD:"Old and new password are not match",
    COLUMN_NOT_FOUND:"This columns not belongs to this group",
    PERMISSION_ERROR:"Permission not provided",
    VALIDATION_ERROR:"Input value does not match the validation/condition",
    INVALID_REQUEST: 'invalid request',
    PAYMENT_FAILURE:"Payment Fail",
    INSUFFICIENT_BALANCE:'You dont have required balance to send campaigns',
    EXPIRE_PLAN:"Your plan has been expire",
    NO_PLAN:"Right now user not have any plan",
    ID_ALREADY_EXISTS:"Id ALREADY EXIST"

    // INTERNAL_SERVER_ERROR
};

exports.success = (result, res, code = 400) => {
    try {
        const response = {
            success: true,
            status_code: code,
            message: successMessage[result.message] || httpStatus[code],
            result: result.data ? result.data : '',
            time: Date.now()
        };
        
        res.status(code).json(response);
    }
    catch (error) {
        console.log(
            '🚀 ~ file: response.js ~ line 12 ~ exports.success= ~ error',
            error
        );

        return res.json({
            success: true,
            status_code: 500,
            message: 'Internal Server Error.',
            result: '',
            time: Date.now()
        });
    }
};

exports.error = (error, res, code) => {
    try {
        const response = {
            success: false,
            status_code: code,
            message: errorMessage[error.message] || httpStatus[code],
            result: {
                error: error.data ? error.data : error.error
            },
            time: Date.now()
        };
        res.status(code).json(response);
    }
    catch (err) {
        console.log(
            '🚀 ~ file: response.js ~ line 23 ~ exports.success= ~ err',
            err
        );

        return res.status(500).json({
            success: false,
            status_code: 500,
            message: 'Internal Server error.',
            result: '',
            time: Date.now()
        });
    }
};

