const httpStatus = require('http-status');
const { rules } = require('../../rules/model/rulesModel')
const { manageContact } = require('../model/model')
const xlxs = require('xlsx')
const response = require("../../../utils/response");
const { set } = require('mongoose/lib/schematype');
const { getValue } = require('mongoose/lib/utils');
const { notEnterDbmanageContact } = require("../model/notenterinDb")
const mongoose = require("mongoose");
const { manageGroup } = require('../../group/model/groupModel');
exports.addContact = async (req, res) => {
    try {
        let findExcel = await manageContact.findOne({ groupId: req.body.groupId })

        let find = await rules.find({ groupId: req.params.id })
        // console.log("-------------",find)
        if (find) {
            const file = xlxs.readFile(req.file.path)
            let data = []

            const sheets = file.SheetNames

            for (let i = 0; i < sheets.length; i++) {
                const temp = xlxs.utils.sheet_to_json(
                    file.Sheets[file.SheetNames[i]],
                    { defval: "" }
                )
                temp.forEach((res) => {
                    data.push(res)
                })
            }
            // console.log("______ _________ ________ ________ __________ _____", data)
            //   console.log('data================',data)

            // console.log(x) 

            function checkColumnExist() {
                let myArr = [];
                for (let i = 0; i < data.length; i++) {
                    let fields = Object.keys(data[i]);
                    console.log("_______fields____fields____fields____fields_____", fields)
                    for (let j = 0; j < fields.length; j++) {

                        if (JSON.stringify(find).includes(fields[j])) {
                            if (j === fields.length - 1) {
                                myArr.push(data[i]);
                            }
                        } else {
                            break;
                        }
                    }
                }
                return myArr;
            }
            let columnsExistArr = checkColumnExist();
            let validationObject = {};
            for (let i = 0; i < find.length; i++) {
                validationObject[find[i].columnName] = {
                    maximumLength: find[i].maximumLength,
                    validation: find[i].validation,
                    dataType: find[i].dataType,
                    required: find[i].required,
                    unique: find[i].unique
                };
            }
            // console.log(validationObject)
            var arrToEnterDb = [];
            var arrayNotEnterInDb = [];
            console.log(req.body.groupId)
            for (let i = 0; i < columnsExistArr.length; i++) {
                if (checkItemValidation(columnsExistArr[i])) {
                    //arrToEnterDb.push(columnsExistArr[i]);
                    let groupId = req.body.groupId;
                    arrToEnterDb.push({ ...columnsExistArr[i], groupId })

                    console.log(arrToEnterDb)
                } else {
                    let groupId = req.body.groupId;
                    arrayNotEnterInDb.push({ ...columnsExistArr[i], groupId, audienceType: "In-Active" });
                }
            }
            //------------------------------------

            function checkItemValidation(obj) {
                let validationPassed = true;
                Object.keys(validationObject).map((field) => {
                    if (validationObject[field].validation === "number" && validationObject[field].dataType === "number") {
                        if (validationObject[field].required && obj[field].toString().length != 0 && typeof obj[field] === validationObject[field].dataType) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    } else if (validationObject[field].validation === "email" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (
                                            obj[field].toString().length <=
                                            validationObject[field].maximumLength &&
                                            typeof obj[field] === validationObject[field].dataType &&
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (
                                    obj[field].toString().length <=
                                    validationObject[field].maximumLength &&
                                    typeof obj[field] === validationObject[field].dataType &&
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    } else if (validationObject[field].validation === "mobilenumber" && validationObject[field].dataType === "number") {
                        console.log(validationObject[field].validation, validationObject[field].dataType)
                        //console.log(validationObject[field],obj[field]) 
                        if (validationObject[field].required && obj[field].toString().length == 10) {
                            if (validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    }
                    else if (validationObject[field].validation === "dob" && validationObject[field].dataType === "dob") {
                        if (validationObject[field].required) {
                            var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                            if (validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }


                                    } else {

                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (re.test(obj[field])) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                if (re.test(obj[field])) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                // // function validateDOB(dateString) {
                                // //     // Check if the input is a valid string
                                // //     if (typeof dateString !== "string") {
                                // //       return false;
                                // //     }

                                // //     // Parse the input string into a Date object
                                // //     const dob = new Date(dateString);

                                // //     // Check if the input is a valid date object
                                // //     if (Object.prototype.toString.call(dob) !== "[object Date]") {
                                // //       return false;
                                // //     }

                                // //     // Check if the input is not NaN
                                // //     if (isNaN(dob.getTime())) {
                                // //       return false;
                                // //     }

                                // //     // Check if the year is in the valid range
                                // //     const minYear = 1900;
                                // //     const maxYear = new Date().getFullYear();
                                // //     const year = dob.getFullYear();
                                // //     if (year < minYear || year > maxYear) {
                                // //       return false;
                                // //     }

                                // //     // Check if the month is in the valid range
                                // //     const month = dob.getMonth() + 1;
                                // //     if (month < 1 || month > 12) {
                                // //       return false;
                                // //     }

                                // //     // Check if the day is in the valid range
                                // //     const day = dob.getDate();
                                // //     if (day < 1 || day > 31) {
                                // //       return false;
                                // //     }

                                // //     // Check if the date is valid
                                // //     if (month === 2 && day > 29) {
                                // //       return false;
                                // //     }
                                // //     if ([4, 6, 9, 11].includes(month) && day > 30) {
                                // //       return false;
                                // //     }

                                // //     // If all checks pass, the DOB is valid
                                // //     return true;
                                // //   }
                                //   function validateDOB(dateString) {
                                //     // Check if the input is a valid string
                                //     if (typeof dateString !== "string") {
                                //       return false;
                                //     }

                                //     // Split the input string into day, month, and year components
                                //     const dateParts = dateString.split("-");
                                //     if (dateParts.length !== 3) {
                                //       return false;
                                //     }

                                //     // Parse the day, month, and year components  
                                //     const day = parseInt(dateParts[0], 10);
                                //     const month = parseInt(dateParts[1], 10);
                                //     const year = parseInt(dateParts[2], 10);

                                //     // Check if the day, month, and year are valid
                                //     if (isNaN(day) || day < 1 || day > 31) {
                                //       return false;
                                //     }
                                //     if (isNaN(month) || month < 1 || month > 12) {
                                //       return false;
                                //     }
                                //     if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                                //       return false;
                                //     }

                                //     // Check if the date is valid
                                //     const dob = new Date(year, month - 1, day);
                                //     if (isNaN(dob.getTime())) {
                                //       return false;
                                //     }
                                //     if (dob.getDate() !== day || dob.getMonth() !== month - 1 || dob.getFullYear() !== year) {
                                //       return false;
                                //     }

                                //     // If all checks pass, the DOB is valid
                                //     return true;
                                //   }
                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/

                                console.log(re.test(obj[field]))
                                if (
                                    // validateDOB(obj[field]) 
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    }
                    else if (validationObject[field].validation === "string" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (!`${obj[field]}`.includes("@")) {
                                            if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                            } else {
                                                if (validationPassed) {
                                                    validationPassed = false;
                                                }
                                            }
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (!`${obj[field]}`.includes("@")) {
                                    if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                    } else {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    }
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = true;
                                }
                            }


                        } else if (!validationObject[field].required) {

                            if (!validationObject[field].required && validationObject[field].unique) {

                                for (let item of arrToEnterDb) {

                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }

                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            console.log("23456");
                        }
                    }
                });
                return validationPassed;
            }


            // console.log(arrToEnterDb, "arrToEnterDb");
            // console.log(arrayNotEnterInDb, "arrayNotEnterInDb");
            // function checkItemValidation(obj) {
            //     let validationPassed = true;
            //     Object.keys(validationObject).map((field) => {
            //         if (validationObject[field].validation === "number" && validationObject[field].dataType === "number") {
            //             if (validationObject[field].required && obj[field].toString().length != 0 && typeof obj[field] === validationObject[field].dataType) {
            //                 if (validationObject[field].required && validationObject[field].unique) {
            //                     for (let item of arrToEnterDb) {
            //                         if (item[field] == obj[field]) {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         } else {
            //                             if (obj[field].toString().length <= validationObject[field].maximumLength) {
            //                             } else {
            //                                 if (validationPassed) {
            //                                     validationPassed = false;
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 } else if (validationObject[field].required && !validationObject[field].unique) {
            //                     if (obj[field].toString().length <= validationObject[field].maximumLength) {
            //                     } else {
            //                         if (validationPassed) {
            //                             validationPassed = false;
            //                         }
            //                     }
            //                 } else {
            //                     if (validationPassed) {
            //                         validationPassed = false;
            //                     }
            //                 }
            //             } else if (!validationObject[field].required) {
            //                 if (!validationObject[field].required && validationObject[field].unique) {
            //                     for (let item of arrToEnterDb) {
            //                         if (item[field] == obj[field]) {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         } else {
            //                             if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
            //                             } else {
            //                                 if (validationPassed) {
            //                                     validationPassed = false;
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 } else if (!validationObject[field].required && !validationObject[field].unique) {
            //                     if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
            //                     } else {
            //                         if (validationPassed) {
            //                             validationPassed = false;
            //                         }
            //                     }
            //                 } else {
            //                     if (validationPassed) {
            //                         validationPassed = false;
            //                     }
            //                 }
            //             } else {
            //                 if (validationPassed) {
            //                     validationPassed = false;
            //                     //  console.log( obj)
            //                 }
            //             } 
            //         } else if (validationObject[field].validation === "email" && validationObject[field].dataType === "string") {
            //             if (validationObject[field].required) {
            //                 if (validationObject[field].required && validationObject[field].unique) {

            //                     for (let item of arrToEnterDb) {
            //                         if (item[field] == obj[field]) {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         } else {
            //                             var re = /\S+@\S+\.\S+/;

            //                             if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
            //                             } else {
            //                                 if (validationPassed) {
            //                                     validationPassed = false;
            //                                 }
            //                             }
            //                         }
            //                     }

            //                 } else if (validationObject[field].required && !validationObject[field].unique) {
            //                     var re = /\S+@\S+\.\S+/;
            //                     if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
            //                     } else {
            //                         if (validationPassed) {
            //                             validationPassed = false;
            //                         }
            //                     }
            //                 } else {
            //                     if (validationPassed) {
            //                         validationPassed = false;
            //                     }
            //                 }
            //             }
            //             else if (!validationObject[field].required) {
            //                 if (!validationObject[field].required && validationObject[field].unique) {
            //                     for (let item of arrToEnterDb) {
            //                         if (item[field] == obj[field]) {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         } else {
            //                             var re = /\S+@\S+\.\S+/;
            //                             if (
            //                                 obj[field].toString().length <=
            //                                 validationObject[field].maximumLength &&
            //                                 typeof obj[field] === validationObject[field].dataType &&
            //                                 re.test(obj[field])
            //                             ) {
            //                             } else {
            //                                 if (validationPassed) {
            //                                     validationPassed = false;
            //                                 }
            //                             }
            //                         }
            //                     }

            //                 } else if (!validationObject[field].required && !validationObject[field].unique) {
            //                     var re = /\S+@\S+\.\S+/;
            //                     if (
            //                         obj[field].toString().length <=
            //                         validationObject[field].maximumLength &&
            //                         typeof obj[field] === validationObject[field].dataType &&
            //                         re.test(obj[field])
            //                     ) {
            //                     } else {
            //                         if (validationPassed) {
            //                             validationPassed = false;
            //                         }
            //                     }
            //                 } else {
            //                     if (validationPassed) {
            //                         validationPassed = false;
            //                     }
            //                 }
            //             } else {
            //                 if (validationPassed) {
            //                     validationPassed = true;
            //                 }
            //             }
            //         } else if (validationObject[field].validation === "string" && validationObject[field].dataType === "string") {
            //             if (validationObject[field].required) {
            //                 if (validationObject[field].required && validationObject[field].unique) {
            //                     for (let item of arrToEnterDb) {
            //                         if (item[field] == obj[field]) {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         } else {
            //                             if (!`${obj[field]}`.includes("@")) {
            //                                 if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
            //                                 } else {
            //                                     if (validationPassed) {
            //                                         validationPassed = false;
            //                                     }
            //                                 }
            //                             } else {
            //                                 if (validationPassed) {
            //                                     validationPassed = false;
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 } else if (validationObject[field].required && !validationObject[field].unique) {
            //                     if (!`${obj[field]}`.includes("@")) {
            //                         if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
            //                         } else {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         }
            //                     } else {
            //                         if (validationPassed) {
            //                             validationPassed = false;
            //                         }
            //                     }
            //                 } else {
            //                     if (validationPassed) {
            //                         validationPassed = true;
            //                     }
            //                 }


            //             } else if (!validationObject[field].required) {

            //                 if (!validationObject[field].required && validationObject[field].unique) {

            //                     for (let item of arrToEnterDb) {

            //                         if (item[field] == obj[field]) {
            //                             if (validationPassed) {
            //                                 validationPassed = false;
            //                             }
            //                         } else {
            //                             if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
            //                             ) {
            //                             } else {
            //                                 if (validationPassed) {
            //                                     validationPassed = false;
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 } else if (!validationObject[field].required && !validationObject[field].unique) {
            //                     if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
            //                     ) {
            //                     } else {
            //                         if (validationPassed) {
            //                             validationPassed = false;
            //                         }
            //                     }

            //                 } else {
            //                     if (validationPassed) {
            //                         validationPassed = false;
            //                     }
            //                 }
            //             } else {
            //                 console.log("23456");
            //             }
            //         } 
            //     });
            //     return validationPassed;
            // } 

        }
        else {
            return response.error({ msgCode: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);
        }

        if (findExcel) {
            if (arrToEnterDb.length == 0 && arrayNotEnterInDb == 0) {
                return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

            }
            console.log("1234", arrToEnterDb)
            console.log(findExcel)
            let deleteDataenterdb = manageContact.deleteMany({ groupId: req.params.id })
            let notenterdataDelete = notEnterDbmanageContact.deleteMany({ groupId: req.params.id })
            let deleteData = await Promise.all([deleteDataenterdb, notenterdataDelete])
            if (deleteData) {
                let saveResult = await manageContact.insertMany(arrToEnterDb)
                let saveResult1 = await notEnterDbmanageContact.insertMany(arrayNotEnterInDb)

                //   let saveResult = await manageContact.replaceMany( arrToEnterDb )
                console.log(saveResult)
                if (saveResult) {
                    return response.success({ msgCode: 'API_SUCCESS', data: saveResult }, res, httpStatus.OK);
                }
                else {
                    return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

                }
            }

        }
        else {
            console.log("1234", arrToEnterDb)
            if (arrToEnterDb.length == 0 && arrayNotEnterInDb == 0) {
                return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

            }
            let saveResult = await manageContact.insertMany(arrToEnterDb)
            let saveResult1 = await notEnterDbmanageContact.insertMany(arrayNotEnterInDb)

            console.log(saveResult)
            console.log(saveResult)
            if (saveResult) {
                return response.success({ msgCode: 'API_SUCCESS', data: saveResult }, res, httpStatus.OK);
            }
            else {
                return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

            }
        }


    }


    catch (error) {

        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getmanageContact = async (req, res) => {
    try {
        //   let xx=await  manageContact.paginate({groupId: req.params.id, audienceType:"Active"}, { page: 3, limit: 10 })
        //   console.log(xx)


        //
        let user;
        // const { page, limit } = req.query;
        if (req.params.name == "Active") {

            // user = await manageContact.paginate({ groupId: req.params.id, audienceType: "Active" }, { page: page, limit: limit });
            user = await manageContact.find({ groupId: req.params.id, audienceType: "Active" });

            console.log(user)
        }
        if (req.params.name == "findAll") {
            let findAudience = await manageContact.countDocuments({ groupId: req.params.id })
            let updateInGroup = await manageGroup.updateOne({ _id: req.params.id }, {
                $set:
                    { totalNumberOfAudience: findAudience }
            }
                , { new: true })
            // user = await manageContact.paginate({ groupId: req.params.id }, { page: page, limit: limit });
            user = await manageContact.find({ groupId: req.params.id });

            console.log(user)
        }

        if (!user) {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)
        } else {
            return response.success({ message: 'API_SUCCESS', data: user }, res, httpStatus.OK)
        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getExcelNotEnterDb = async (req, res) => {
    try {

        const user = await notEnterDbmanageContact.find({ groupId: req.params.id });
        console.log(user)
        if (!user) {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)
        } else {
            return response.success({ message: 'API_SUCCESS', data: user }, res, httpStatus.OK)
        }
    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateExcelFile = async (req, res) => {
    try {

        let find = await rules.find({ groupId: req.params.id })
        // console.log("-------------",find)
        if (find) {
            const file = xlxs.readFile(req.file.path)

            let data = []

            const sheets = file.SheetNames

            for (let i = 0; i < sheets.length; i++) {
                const temp = xlxs.utils.sheet_to_json(
                    file.Sheets[file.SheetNames[i]], { defval: "" })
                temp.forEach((res) => {
                    data.push(res)
                })
            }
            // console.log("______ _________ ________ ________ __________ _____", data)
            // console.log('data================',data)

            // console.log(x)

            function checkColumnExist() {
                let myArr = [];
                for (let i = 0; i < data.length; i++) {
                    let fields = Object.keys(data[i]);
                    console.log("_______fields____fields____fields____fields_____", fields)
                    for (let j = 0; j < fields.length; j++) {

                        if (JSON.stringify(find).includes(fields[j])) {
                            if (j === fields.length - 1) {
                                myArr.push(data[i]);
                            }
                        } else {
                            break;
                        }
                    }
                }
                return myArr;
            }
            let columnsExistArr = checkColumnExist();
            let validationObject = {};
            for (let i = 0; i < find.length; i++) {
                validationObject[find[i].columnName] = {
                    maximumLength: find[i].maximumLength,
                    validation: find[i].validation,
                    dataType: find[i].dataType,
                    required: find[i].required,
                    unique: find[i].unique
                };
            }
            // console.log(validationObject)
            var changearrToEnterDb = [];
            var changearrayNotEnterInDb = [];
            for (let i = 0; i < columnsExistArr.length; i++) {
                if (checkItemValidation(columnsExistArr[i])) {
                    let groupId = req.body.groupId;
                    changearrToEnterDb.push({ ...columnsExistArr[i], groupId })
                } else {
                    let groupId = req.body.groupId;
                    changearrayNotEnterInDb.push({ ...columnsExistArr[i], groupId, audienceType: "In-Active" });

                }
            }


            function checkItemValidation(obj) {
                let validationPassed = true;
                Object.keys(validationObject).map((field) => {
                    if (validationObject[field].validation === "number" && validationObject[field].dataType === "number") {
                        if (validationObject[field].required && obj[field].toString().length != 0 && typeof obj[field] === validationObject[field].dataType) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of changearrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of changearrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    } else if (validationObject[field].validation === "email" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {

                                for (let item of changearrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of changearrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (
                                            obj[field].toString().length <=
                                            validationObject[field].maximumLength &&
                                            typeof obj[field] === validationObject[field].dataType &&
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (
                                    obj[field].toString().length <=
                                    validationObject[field].maximumLength &&
                                    typeof obj[field] === validationObject[field].dataType &&
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    } else if (validationObject[field].validation === "string" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of changearrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (!`${obj[field]}`.includes("@")) {
                                            if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                            } else {
                                                if (validationPassed) {
                                                    validationPassed = false;
                                                }
                                            }
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (!`${obj[field]}`.includes("@")) {
                                    if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                    } else {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    }
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = true;
                                }
                            }


                        } else if (!validationObject[field].required) {

                            if (!validationObject[field].required && validationObject[field].unique) {

                                for (let item of changearrToEnterDb) {

                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }

                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            console.log("23456");
                        }
                    }
                    else if (validationObject[field].validation === "dob" && validationObject[field].dataType === "dob") {
                        if (validationObject[field].required) {
                            var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                            if (validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }


                                    } else {

                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (re.test(obj[field])) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                if (re.test(obj[field])) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                // // function validateDOB(dateString) {
                                // //     // Check if the input is a valid string
                                // //     if (typeof dateString !== "string") {
                                // //       return false;
                                // //     }

                                // //     // Parse the input string into a Date object
                                // //     const dob = new Date(dateString);

                                // //     // Check if the input is a valid date object
                                // //     if (Object.prototype.toString.call(dob) !== "[object Date]") {
                                // //       return false;
                                // //     }

                                // //     // Check if the input is not NaN
                                // //     if (isNaN(dob.getTime())) {
                                // //       return false;
                                // //     }

                                // //     // Check if the year is in the valid range
                                // //     const minYear = 1900;
                                // //     const maxYear = new Date().getFullYear();
                                // //     const year = dob.getFullYear();
                                // //     if (year < minYear || year > maxYear) {
                                // //       return false;
                                // //     }

                                // //     // Check if the month is in the valid range
                                // //     const month = dob.getMonth() + 1;
                                // //     if (month < 1 || month > 12) {
                                // //       return false;
                                // //     }

                                // //     // Check if the day is in the valid range
                                // //     const day = dob.getDate();
                                // //     if (day < 1 || day > 31) {
                                // //       return false;
                                // //     }

                                // //     // Check if the date is valid
                                // //     if (month === 2 && day > 29) {
                                // //       return false;
                                // //     }
                                // //     if ([4, 6, 9, 11].includes(month) && day > 30) {
                                // //       return false;
                                // //     }

                                // //     // If all checks pass, the DOB is valid
                                // //     return true;
                                // //   }
                                //   function validateDOB(dateString) {
                                //     // Check if the input is a valid string
                                //     if (typeof dateString !== "string") {
                                //       return false;
                                //     }

                                //     // Split the input string into day, month, and year components
                                //     const dateParts = dateString.split("-");
                                //     if (dateParts.length !== 3) {
                                //       return false;
                                //     }

                                //     // Parse the day, month, and year components  
                                //     const day = parseInt(dateParts[0], 10);
                                //     const month = parseInt(dateParts[1], 10);
                                //     const year = parseInt(dateParts[2], 10);

                                //     // Check if the day, month, and year are valid
                                //     if (isNaN(day) || day < 1 || day > 31) {
                                //       return false;
                                //     }
                                //     if (isNaN(month) || month < 1 || month > 12) {
                                //       return false;
                                //     }
                                //     if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                                //       return false;
                                //     }

                                //     // Check if the date is valid
                                //     const dob = new Date(year, month - 1, day);
                                //     if (isNaN(dob.getTime())) {
                                //       return false;
                                //     }
                                //     if (dob.getDate() !== day || dob.getMonth() !== month - 1 || dob.getFullYear() !== year) {
                                //       return false;
                                //     }

                                //     // If all checks pass, the DOB is valid
                                //     return true;
                                //   }
                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/

                                console.log(re.test(obj[field]))
                                if (
                                    // validateDOB(obj[field]) 
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    }
                    else if (validationObject[field].validation === "mobilenumber" && validationObject[field].dataType === "number") {
                        console.log(validationObject[field].validation, validationObject[field].dataType)
                        //console.log(validationObject[field],obj[field]) 
                        if (validationObject[field].required && obj[field].toString().length == 10) {
                            if (validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    }
                });
                return validationPassed;
            }
            console.log("1234", changearrToEnterDb)
            console.log("1234", changearrToEnterDb)

            let enterdb = await manageContact.insertMany(changearrToEnterDb)
            if (enterdb) {
                let saveResNotEnterDb = await notEnterDbmanageContact.deleteMany({ groupId: req.params.id })
                if (saveResNotEnterDb) {
                    let saveResult = notEnterDbmanageContact.insertMany(changearrayNotEnterInDb)
                    console.log(saveResult)
                    if (saveResult) {
                        return response.success({ msgCode: 'API_SUCCESS', data: enterdb }, res, httpStatus.OK);
                    }
                    else {
                        return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

                    }

                }
                else {
                    return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

                }
            }
            else {
                return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

            }


        }
        else {
            return response.error({ msgCode: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);
        }

    }
    catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.filterApi = async (req, res) => {
    try {
        console.log(req.body.filterArray)
        let value = req.body.filterArray
        console.log(value)
        const userFilter = await manageContact.findOne({ groupId: req.params.id })
        if (userFilter) {
            const data = userFilter.arrToEnterDb
            const unique = [...new Set(data.map(item => item[value]))]
            return response.success({ message: 'API_SUCCESS', data: unique }, res, httpStatus.OK)
        }
        else {
            return response.error({ msgCode: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);

        }
    } catch (error) {
        console.log("error__________________________", error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.innerFilter = async (req, res) => {
    try {

        let userFilter = await manageContact.findOne({ groupId: req.params.id })
        console.log(userFilter.arrToEnterDb)
        const data = userFilter.arrToEnterDb
        const searchKeys = req.body
        console.log(Object.keys(searchKeys))
        // let b 
        // const unique = [...new Set(data.map(item => item[value]))]
        // res.send(unique)
        // for (var key in a) {
        //   console.log(Object.keys(key));
        //    console.log(b)
        //   }
        // const searchKeys =  {
        //   firstName: 'himanshu',
        //   lastName: 'pandey',
        //   email: 'parshad@gmail.com',
        //   phoneNumber: 1234568
        // };
        // console.log("search",searchKeys)

        const filteredData = userFilter.arrToEnterDb.filter(item => {
            return Object.keys(searchKeys).every(key => {
                console.log(item[key], searchKeys[key], "___________----------_____________-------------____________", key)
                return item[key] === searchKeys[key];
            });
        });
        console.log("_______------_____-----_______------_____----", filteredData)
        res.send(filteredData)

        // if (userFilter) {
        //   let filter = userFilter.arrToEnterDb
        //   let arr = []
        //   let columnName=req.body.columnName
        //   let value= req.body.value
        //   // for(let i=0; i<columnName)
        //   filter.map((item) => {
        //     console.log("234",item)

        //     if (item[columnName] == value) {
        //       console.log("_______", item)
        //       arr.push(item)
        //     } 

        //   }) 
        //   console.log(arr)
        //   console.log(arr)
        //   return response.success({ message: 'API_SUCCESS', data: arr }, res, httpStatus.OK)

        // }
        // else {
        //   return response.error({ msgCode: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);
        // }

    } catch (error) {
        console.log("error__________________________", error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.innerFilter = async (req, res) => {
    try {

        let userFilter = await manageContact.find({ groupId: req.params.id })
        console.log(userFilter)
        let data = req.body
        // data = data[0]
        if (userFilter) {

            function searchPeople(data) {
                return userFilter.filter(person => {
                    let match = true;
                    for (let key in data) {
                        if (!person.hasOwnProperty(key)) {
                            throw new Error(`Invalid property: ${key}`);
                        }
                        const value = data[key]
                        const personValue = typeof person[key] === 'number' ? person[key].toString() : person[key];
                        if (Array.isArray(value)) {
                            // if (!value.includes(person[key])) {
                            if (!value.includes(personValue)) {
                                match = false;
                                break;
                            }
                        } else {
                            // if (person[key] !== value) {
                            if (personValue !== value) {
                                match = false;
                                break;
                            }
                        }
                    }
                    return match;
                });
            }
            let result = searchPeople(data)
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)



    } catch (error) {
        console.log("error__________________________", error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.checkType = async (req, res) => {
    try {
        const type = req.body
        console.log(type.type == 'string' || type.type == 'String')
        if (type.type == 'string' || type.type == 'String') {
            const result = ["string", "email"]
            return response.success({ message: 'API_SUCCESS', data: result }, res, httpStatus.OK)

        }
        else if (type.type == 'number' || type.type == 'Number') {
            const result = ["number"]
            return response.success({ message: 'API_SUCCESS', data: result }, res, httpStatus.OK)
        }
        else {
            const result = `please Select one of String or Number`
            return response.success({ message: 'API_SUCCESS', data: result }, res, httpStatus.OK)
        }
    }
    catch (error) {
        console.log(error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateSinglePeople = async (req, res) => {
    try {
        let findExcel = await manageContact.findOne({ _id: req.params.id })
        console.log(findExcel)
        let find = await rules.find({ groupId: req.body.groupId })
        // console.log("-------------",find)
        if (find) {

            console.log(req.body)
            var data = [req.body]
            console.log(data)

            function checkColumnExist() {
                let myArr = [];
                for (let i = 0; i < data.length; i++) {
                    let fields = Object.keys(data[i]);
                    console.log("_______fields____fields____fields____fields_____", fields)
                    for (let j = 0; j < fields.length; j++) {

                        if (JSON.stringify(find).includes(fields[j])) {
                            if (j === fields.length - 1) {
                                myArr.push(data[i]);
                            }
                        } else {
                            break;
                        }
                    }
                }
                return myArr;
            }
            let columnsExistArr = checkColumnExist();
            let validationObject = {};
            for (let i = 0; i < find.length; i++) {
                validationObject[find[i].columnName] = {
                    maximumLength: find[i].maximumLength,
                    validation: find[i].validation,
                    dataType: find[i].dataType,
                    required: find[i].required,
                    unique: find[i].unique
                };
            }
            // console.log(validationObject)
            var arrToEnterDb = [];
            var arrayNotEnterInDb = [];
            console.log(req.body.groupId)
            for (let i = 0; i < columnsExistArr.length; i++) {
                if (checkItemValidation(columnsExistArr[i])) {
                    //arrToEnterDb.push(columnsExistArr[i]);
                    let groupId = req.body.groupId;
                    arrToEnterDb.push({ ...columnsExistArr[i], groupId })

                    console.log(arrToEnterDb)
                } else {
                    let groupId = req.body.groupId;
                    arrayNotEnterInDb.push({ ...columnsExistArr[i], groupId, audienceType: "In-Active" });
                }
            }

            function checkItemValidation(obj) {
                let validationPassed = true;
                Object.keys(validationObject).map((field) => {
                    if (validationObject[field].validation === "number" && validationObject[field].dataType === "number") {
                        if (validationObject[field].required && obj[field].toString().length != 0 && typeof obj[field] === validationObject[field].dataType) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    } else if (validationObject[field].validation === "email" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (
                                            obj[field].toString().length <=
                                            validationObject[field].maximumLength &&
                                            typeof obj[field] === validationObject[field].dataType &&
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (
                                    obj[field].toString().length <=
                                    validationObject[field].maximumLength &&
                                    typeof obj[field] === validationObject[field].dataType &&
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    } else if (validationObject[field].validation === "mobilenumber" && validationObject[field].dataType === "number") {
                        console.log(validationObject[field].validation, validationObject[field].dataType)
                        //console.log(validationObject[field],obj[field]) 
                        if (validationObject[field].required && obj[field].toString().length == 10) {
                            if (validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    }
                    else if (validationObject[field].validation === "dob" && validationObject[field].dataType === "dob") {
                        if (validationObject[field].required) {
                            var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                            if (validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }


                                    } else {

                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (re.test(obj[field])) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                if (re.test(obj[field])) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                    // --



                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                            if (!validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                                
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {

                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/

                                console.log(re.test(obj[field]))
                                if (
                                    // validateDOB(obj[field]) 
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;

                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    //   return response.error({ message: 'DOB_VALIDATION_FAILED'}, res, httpStatus.FORBIDDEN);

                                    validationPassed = false;

                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    }
                    else if (validationObject[field].validation === "string" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (!`${obj[field]}`.includes("@")) {
                                            if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                            } else {
                                                if (validationPassed) {
                                                    validationPassed = false;
                                                }
                                            }
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (!`${obj[field]}`.includes("@")) {
                                    if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                    } else {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    }
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = true;
                                }
                            }


                        } else if (!validationObject[field].required) {

                            if (!validationObject[field].required && validationObject[field].unique) {

                                for (let item of arrToEnterDb) {

                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }

                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            console.log("23456");
                        }
                    }

                });
                return validationPassed;
            }

        }
        else {
            return response.error({ message: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);
        }

        if (findExcel) {

            console.log("1234", arrToEnterDb)
            console.log(findExcel)
            if (arrToEnterDb.length == 1) {
                let saveResult = await manageContact.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
                return response.success({ message: 'API_SUCCESS', data: saveResult }, res, httpStatus.OK);

            }
            else {
                return response.error({ message: 'VALIDATION_ERROR', }, res, httpStatus.OK);
                // let result =  notEnterDbmanageContact.insertMany(arrayNotEnterInDb)
                // let deleteNotEnterDb= manageContact.deleteOne({_id: req.params.id })
                // let deleteData = await Promise.all([result, deleteNotEnterDb])
                // console.log("deleteDaaaaaaaa",deleteData)
                // return response.success({ message: 'VALIDATION_ERROR', }, res, httpStatus.OK);
            }
        }
    }
    catch (error) {
        console.log(error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateNotEnterDbSinglePeople = async (req, res) => {
    try {
        let findExcel = await notEnterDbmanageContact.findOne({ _id: req.params.id })
        console.log(findExcel)
        let find = await rules.find({ groupId: req.body.groupId })
        // console.log("-------------",find)
        if (find) {

            console.log(req.body)
            var data = [req.body]
            console.log("15", data, typeof data)

            function checkColumnExist() {
                let myArr = [];
                for (let i = 0; i < data.length; i++) {
                    let fields = Object.keys(data[i]);
                    console.log("_______fields____fields____fields____fields_____", fields)
                    for (let j = 0; j < fields.length; j++) {

                        if (JSON.stringify(find).includes(fields[j])) {
                            if (j === fields.length - 1) {
                                myArr.push(data[i]);
                            }
                        } else {
                            break;
                        }
                    }
                }
                return myArr;
            }
            let columnsExistArr = checkColumnExist();
            let validationObject = {};
            for (let i = 0; i < find.length; i++) {
                validationObject[find[i].columnName] = {
                    maximumLength: find[i].maximumLength,
                    validation: find[i].validation,
                    dataType: find[i].dataType,
                    required: find[i].required,
                    unique: find[i].unique
                };
            }
            // console.log(validationObject)
            var arrToEnterDb = [];
            var arrayNotEnterInDb = [];
            console.log(req.body.groupId)
            for (let i = 0; i < columnsExistArr.length; i++) {
                if (checkItemValidation(columnsExistArr[i])) {
                    //arrToEnterDb.push(columnsExistArr[i]);
                    let groupId = req.body.groupId;
                    arrToEnterDb.push({ ...columnsExistArr[i], groupId })

                    console.log(arrToEnterDb)
                } else {
                    let groupId = req.body.groupId;
                    arrayNotEnterInDb.push({ ...columnsExistArr[i], groupId });
                }
            }

            function checkItemValidation(obj) {
                let validationPassed = true;
                Object.keys(validationObject).map((field) => {
                    if (validationObject[field].validation === "number" && validationObject[field].dataType === "number") {
                        if (validationObject[field].required && obj[field].toString().length != 0 && typeof obj[field] === validationObject[field].dataType) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    } else if (validationObject[field].validation === "email" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /\S+@\S+\.\S+/;
                                        if (
                                            obj[field].toString().length <=
                                            validationObject[field].maximumLength &&
                                            typeof obj[field] === validationObject[field].dataType &&
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                var re = /\S+@\S+\.\S+/;
                                if (
                                    obj[field].toString().length <=
                                    validationObject[field].maximumLength &&
                                    typeof obj[field] === validationObject[field].dataType &&
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    } else if (validationObject[field].validation === "mobilenumber" && validationObject[field].dataType === "number") {
                        console.log(validationObject[field].validation, validationObject[field].dataType)
                        //console.log(validationObject[field],obj[field]) 
                        if (validationObject[field].required && obj[field].toString().length == 10) {
                            if (validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else if (!validationObject[field].required) {
                            if (!validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
                                if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = false;
                                //  console.log( obj)
                            }
                        }
                    }
                    else if (validationObject[field].validation === "dob" && validationObject[field].dataType === "dob") {
                        if (validationObject[field].required) {
                            var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                            if (validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {

                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }


                                    } else {

                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (re.test(obj[field])) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                if (re.test(obj[field])) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                    // --



                                }
                            }
                        }
                        else if (!validationObject[field].required) {
                            var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                            if (!validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
                                        if (
                                            re.test(obj[field])
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }

                            } else if (!validationObject[field].required && !validationObject[field].unique) {

                                var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/

                                console.log(re.test(obj[field]))
                                if (
                                    // validateDOB(obj[field]) 
                                    re.test(obj[field])
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            if (validationPassed) {
                                validationPassed = true;
                            }
                        }
                    }
                    else if (validationObject[field].validation === "string" && validationObject[field].dataType === "string") {
                        if (validationObject[field].required) {
                            if (validationObject[field].required && validationObject[field].unique) {
                                for (let item of arrToEnterDb) {
                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (!`${obj[field]}`.includes("@")) {
                                            if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                            } else {
                                                if (validationPassed) {
                                                    validationPassed = false;
                                                }
                                            }
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (validationObject[field].required && !validationObject[field].unique) {
                                if (!`${obj[field]}`.includes("@")) {
                                    if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
                                    } else {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    }
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }
                            } else {
                                if (validationPassed) {
                                    validationPassed = true;
                                }
                            }


                        } else if (!validationObject[field].required) {

                            if (!validationObject[field].required && validationObject[field].unique) {

                                for (let item of arrToEnterDb) {

                                    if (item[field] == obj[field]) {
                                        if (validationPassed) {
                                            validationPassed = false;
                                        }
                                    } else {
                                        if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                        ) {
                                        } else {
                                            if (validationPassed) {
                                                validationPassed = false;
                                            }
                                        }
                                    }
                                }
                            } else if (!validationObject[field].required && !validationObject[field].unique) {
                                if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
                                ) {
                                } else {
                                    if (validationPassed) {
                                        validationPassed = false;
                                    }
                                }

                            } else {
                                if (validationPassed) {
                                    validationPassed = false;
                                }
                            }
                        } else {
                            console.log("23456");
                        }
                    }
                });
                return validationPassed;
            }


        }
        else {
            return response.error({ message: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);
        }

        if (findExcel) {

            console.log("1234", arrToEnterDb)
            console.log(findExcel)
            if (arrToEnterDb.length == 1) {
                req.body.audienceType = "Active"

                let saveResult = await notEnterDbmanageContact.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })

                let result = manageContact.insertMany(saveResult)
                let deleteNotEnterDb = notEnterDbmanageContact.deleteOne({ _id: req.params.id })
                let deleteData = await Promise.all([result, deleteNotEnterDb])
                console.log("deleteDaaaaaaaa", deleteData)
                return response.success({ message: 'API_SUCCESS', }, res, httpStatus.OK);



            }
            else {
                return response.error({ message: 'VALIDATION_ERROR', }, res, httpStatus.FORBIDDEN);

            }
        }
    }
    catch (error) {
        console.log(error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.deleteAudience = async (req, res) => {
    try {

        if (req.params.name == 'Delete') {

            let result = await manageContact.findByIdAndDelete({ _id: req.params.id })
            if (result) {
                return response.success({ message: "DELETED" }, res, httpStatus.OK)
            }
            else {
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

            }
        }

        if (req.params.name == 'SetStatus') {
            let result = await manageContact.findByIdAndUpdate(
                { _id: req.params.id },
                { $set: { audienceType: req.body.audienceType } },
                { new: true, runValidators: true }
            ).lean()

            if (!result) {
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

            }
            else {
                return response.success({ message: "SET_STATUS", data: result }, res, httpStatus.OK)

            }
        }


    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.BAD_REQUEST);
    }
}


//------------------------------
// exports.restriction = async (req, res) => {
//     try {
//         let findExcel = await manageContact.findOne({ groupId: req.body.groupId })

//         let find = await rules.find({ groupId: req.params.id })
//         // console.log("-------------",find)
//         if (find) {
//             const file = xlxs.readFile(req.file.path)
//             let data = []

//             const sheets = file.SheetNames

//             for (let i = 0; i < sheets.length; i++) {
//                 const temp = xlxs.utils.sheet_to_json(
//                     file.Sheets[file.SheetNames[i]],
//                     { defval: "" }
//                 )
//                 temp.forEach((res) => {
//                     data.push(res)
//                 })
//             }
//             const worksheet = xlsx.utils.aoa_to_sheet(data);
//             // console.log("______ _________ ________ ________ __________ _____", data)
//             //   console.log('data================',data)

//             // console.log(x) 

//             function checkColumnExist() {
//                 let myArr = [];
//                 for (let i = 0; i < data.length; i++) {
//                     let fields = Object.keys(data[i]);
//                     console.log("_______fields____fields____fields____fields_____", fields)
//                     for (let j = 0; j < fields.length; j++) {

//                         if (JSON.stringify(find).includes(fields[j])) {
//                             if (j === fields.length - 1) {
//                                 myArr.push(data[i]);
//                             }
//                         } else {
//                             break;
//                         }
//                     }
//                 }
//                 return myArr;
//             }
//             let columnsExistArr = checkColumnExist();
//             let validationObject = {};
//             for (let i = 0; i < find.length; i++) {
//                 validationObject[find[i].columnName] = {
//                     maximumLength: find[i].maximumLength,
//                     validation: find[i].validation,
//                     dataType: find[i].dataType,
//                     required: find[i].required,
//                     unique: find[i].unique
//                 };
//             }
//             // console.log(validationObject)
//             var arrToEnterDb = [];
//             var arrayNotEnterInDb = [];
//             console.log(req.body.groupId)
//             for (let i = 0; i < columnsExistArr.length; i++) {
//                 if (checkItemValidation(columnsExistArr[i])) {
//                     //arrToEnterDb.push(columnsExistArr[i]);
//                     let groupId = req.body.groupId;
//                     arrToEnterDb.push({ ...columnsExistArr[i], groupId })

//                     console.log(arrToEnterDb)
//                 } else {
//                     let groupId = req.body.groupId;
//                     arrayNotEnterInDb.push({ ...columnsExistArr[i], groupId, audienceType: "In-Active" });
//                 }
//             }
//             //------------------------------------

//             function checkItemValidation(obj) {
//                 let validationPassed = true;
//                 Object.keys(validationObject).map((field) => {
//                     if (validationObject[field].validation === "number" && validationObject[field].dataType === "number") {
//                         if (validationObject[field].required && obj[field].toString().length != 0 && typeof obj[field] === validationObject[field].dataType) {
//                             if (validationObject[field].required && validationObject[field].unique) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         if (obj[field].toString().length <= validationObject[field].maximumLength) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else if (validationObject[field].required && !validationObject[field].unique) {
//                                 if (obj[field].toString().length <= validationObject[field].maximumLength) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else if (!validationObject[field].required) {
//                             if (!validationObject[field].required && validationObject[field].unique) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else if (!validationObject[field].required && !validationObject[field].unique) {
//                                 if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else {
//                             if (validationPassed) {
//                                 validationPassed = false;
//                                 //  console.log( obj)
//                             }
//                         }
//                     } else if (validationObject[field].validation === "email" && validationObject[field].dataType === "string") {
//                         if (validationObject[field].required) {
//                             if (validationObject[field].required && validationObject[field].unique) {

//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         var re = /\S+@\S+\.\S+/;
//                                         if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }

//                             } else if (validationObject[field].required && !validationObject[field].unique) {
//                                 var re = /\S+@\S+\.\S+/;
//                                 if (obj[field].toString().length <= validationObject[field].maximumLength && re.test(obj[field]) && typeof obj[field] === validationObject[field].dataType) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         }
//                         else if (!validationObject[field].required) {
//                             if (!validationObject[field].required && validationObject[field].unique) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         var re = /\S+@\S+\.\S+/;
//                                         if (
//                                             obj[field].toString().length <=
//                                             validationObject[field].maximumLength &&
//                                             typeof obj[field] === validationObject[field].dataType &&
//                                             re.test(obj[field])
//                                         ) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }

//                             } else if (!validationObject[field].required && !validationObject[field].unique) {
//                                 var re = /\S+@\S+\.\S+/;
//                                 if (
//                                     obj[field].toString().length <=
//                                     validationObject[field].maximumLength &&
//                                     typeof obj[field] === validationObject[field].dataType &&
//                                     re.test(obj[field])
//                                 ) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else {
//                             if (validationPassed) {
//                                 validationPassed = true;
//                             }
//                         }
//                     } else if (validationObject[field].validation === "mobilenumber" && validationObject[field].dataType === "number") {
//                         console.log(validationObject[field].validation, validationObject[field].dataType)
//                         //console.log(validationObject[field],obj[field]) 
//                         if (validationObject[field].required && obj[field].toString().length == 10) {
//                             if (validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         if (obj[field].toString().length <= validationObject[field].maximumLength) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else if (validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
//                                 if (obj[field].toString().length <= validationObject[field].maximumLength) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else if (!validationObject[field].required) {
//                             if (!validationObject[field].required && validationObject[field].unique && obj[field].toString().length == 10) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else if (!validationObject[field].required && !validationObject[field].unique && obj[field].toString().length == 10) {
//                                 if (obj[field].toString().length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].dataType) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else {
//                             if (validationPassed) {
//                                 validationPassed = false;
//                                 //  console.log( obj)
//                             }
//                         }
//                     }
//                     else if (validationObject[field].validation === "dob" && validationObject[field].dataType === "dob") {
//                         if (validationObject[field].required) {
//                             var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
//                             if (validationObject[field].required && validationObject[field].unique && re.test(obj[field])) {

//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }


//                                     } else {

//                                         var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
//                                         if (re.test(obj[field])) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }

//                             } else if (validationObject[field].required && !validationObject[field].unique) {
//                                 var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
//                                 if (re.test(obj[field])) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         }
//                         else if (!validationObject[field].required) {
//                             if (!validationObject[field].required && validationObject[field].unique) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/
//                                         if (
//                                             re.test(obj[field])
//                                         ) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }

//                             } else if (!validationObject[field].required && !validationObject[field].unique) {
                             
//                                 var re = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/

//                                 console.log(re.test(obj[field]))
//                                 if (
//                                     // validateDOB(obj[field]) 
//                                     re.test(obj[field])
//                                 ) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else {
//                             if (validationPassed) {
//                                 validationPassed = true;
//                             }
//                         }
//                     }
//                     else if (validationObject[field].validation === "string" && validationObject[field].dataType === "string") {
//                         if (validationObject[field].required) {
//                             if (validationObject[field].required && validationObject[field].unique) {
//                                 for (let item of arrToEnterDb) {
//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         if (!`${obj[field]}`.includes("@")) {
//                                             if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
//                                             } else {
//                                                 if (validationPassed) {
//                                                     validationPassed = false;
//                                                 }
//                                             }
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else if (validationObject[field].required && !validationObject[field].unique) {
//                                 if (!`${obj[field]}`.includes("@")) {
//                                     if (obj[field].length != 0 && obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType) {
//                                     } else {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     }
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }
//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = true;
//                                 }
//                             }


//                         } else if (!validationObject[field].required) {

//                             if (!validationObject[field].required && validationObject[field].unique) {

//                                 for (let item of arrToEnterDb) {

//                                     if (item[field] == obj[field]) {
//                                         if (validationPassed) {
//                                             validationPassed = false;
//                                         }
//                                     } else {
//                                         if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
//                                         ) {
//                                         } else {
//                                             if (validationPassed) {
//                                                 validationPassed = false;
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else if (!validationObject[field].required && !validationObject[field].unique) {
//                                 if (obj[field].length <= validationObject[field].maximumLength && typeof obj[field] === validationObject[field].validation && typeof obj[field] === validationObject[field].dataType
//                                 ) {
//                                 } else {
//                                     if (validationPassed) {
//                                         validationPassed = false;
//                                     }
//                                 }

//                             } else {
//                                 if (validationPassed) {
//                                     validationPassed = false;
//                                 }
//                             }
//                         } else {
//                             console.log("23456");
//                         }
//                     }
//                 });
//                 return validationPassed;
//             }


      

//         }
//         else {
//             return response.error({ msgCode: 'GROUP_NOT_FOUND', }, res, httpStatus.FORBIDDEN);
//         }

//         if (findExcel) {
//             if (arrToEnterDb.length == 0 && arrayNotEnterInDb == 0) {
//                 return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

//             }
//             console.log("1234", arrToEnterDb)
//             console.log(findExcel)
//             let deleteDataenterdb = manageContact.deleteMany({ groupId: req.params.id })
//             let notenterdataDelete = notEnterDbmanageContact.deleteMany({ groupId: req.params.id })
//             let deleteData = await Promise.all([deleteDataenterdb, notenterdataDelete])
//             if (deleteData) {
//                 let saveResult = await manageContact.insertMany(arrToEnterDb)
//                 let saveResult1 = await notEnterDbmanageContact.insertMany(arrayNotEnterInDb)

//                 //   let saveResult = await manageContact.replaceMany( arrToEnterDb )
//                 console.log(saveResult)
//                 if (saveResult) {
//                     return response.success({ msgCode: 'API_SUCCESS', data: saveResult }, res, httpStatus.OK);
//                 }
//                 else {
//                     return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

//                 }
//             }

//         }
//         else {
//             console.log("1234", arrToEnterDb)
//             if (arrToEnterDb.length == 0 && arrayNotEnterInDb == 0) {
//                 return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

//             }
//             let saveResult = await manageContact.insertMany(arrToEnterDb)
//             let saveResult1 = await notEnterDbmanageContact.insertMany(arrayNotEnterInDb)

//             console.log(saveResult)
//             console.log(saveResult)
//             if (saveResult) {
//                 return response.success({ msgCode: 'API_SUCCESS', data: saveResult }, res, httpStatus.OK);
//             }
//             else {
//                 return response.error({ msgCode: 'FAILED_TO_ADD', }, res, httpStatus.FORBIDDEN);

//             }
//         }


//     }


//     catch (error) {

//         return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
//     }
// }

