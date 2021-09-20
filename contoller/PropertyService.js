var PropertyModel = require('./PropertyModel');
const RentalRequestModel = require('./RentalRequestModel');
const { v4: uuidv4 } = require('uuid');

class PropertyService {
    constructor() {
    }

    async isPropertyAvailable(propertyId, address, lms){
        return new Promise(async (resolve, reject) => {
            if (propertyId) {
                lms.isPropertyAvailable(propertyId, { from: address })
                    .then(async (data) => {
                        resolve(data);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }
    async depositSecurity(userId, contractId, lms) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ contractId, requestApprovalDone: true });
                if (rentalRequest.length <= 0) {
                    return Promise.reject("Rental request not found or is not approved");
                }
                if (rentalRequest[0].ownerUserId !== userId) {
                    return Promise.reject("Rental request does not belong to the logged in user");
                }
                lms.depositSecurity(contractId, { from: rentalRequest[0].tenantAddress, value: rentalRequest[0].securityDeposit })
                    .then((data, _address) => {
                        return resolve(data);
                    })
                    .catch(err => {
                        console.log(err);
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }

    async payrent(userId, contractId, lms) {
        return new Promise(async (resolve, reject) => {
            if (userId && contractId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ contractId, requestApprovalDone: true });
                if (rentalRequest.length <= 0) {
                    return Promise.reject("Rental request not found or is not approved");
                }
                if (rentalRequest[0].ownerUserId !== userId) {
                    return Promise.reject("Rental request does not belong to the logged in user");
                }
                lms.payRent(contractId, { from: rentalRequest[0].tenantAddress, value: rentalRequest[0].rentAmount })
                    .then(async (_hash, _address) => {
                        console.log(hash)
                        return resolve(_hash);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err);
                    })
            } else {
                return reject("wrong input");
            }
        })
    }

    async getContractDetails(userId, contractId, address, lms) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                lms.getContractDetails(contractId, { from: address })
                    .then(async (data) => {
                        return resolve(data)
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }

    createProperty(userId, details, lms, address) {
        details.userId = userId;
         details.propertyId = uuidv4();
        return new Promise(async (resolve, reject) => {
            if (details) {
                lms.addProperty(details.propertyId, details.propertyType, details.unitNumber, details.pincode, details.location, details.rooms, details.bathrooms, details.parking, details.initialAvailableDate, { from: address })
                    .then(async (data) => {
                        var propertyModelInst = new PropertyModel();
                        details.hash = data;
                        details._id = uuidv4();
                        return resolve(propertyModelInst.createProperty(details));
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }

    findProperty(filter) {
        let dbFilter = {};
        if (filter.propertyId) {
            dbFilter.propertyId = filter.propertyId;
        }
        if (filter.userId) {
            dbFilter.userId = filter.userId;
        }
        if (filter.pincode) {
            dbFilter.pincode = filter.pincode;
        }
        if (filter.tenantUserId) {
            dbFilter.tenantUserId = tenantUserId;
        }
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.findProperty(dbFilter);
    }

    getPropertyById(propertyId, address, lms){
        return new Promise(async (resolve, reject) => {
            if (propertyId) {
                lms.getProperty(propertyId, { from: address })
                    .then(async (data) => {
                        resolve(data);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }

    setRent(propertyId, details, address, lms){
        var propertyModelInst = new PropertyModel();
        return new Promise(async (resolve, reject) => {
            if (propertyId && details.securityDeposit && details.rentAmount && address) {
                lms.setRent(propertyId, details.securityDeposit , details.rentAmount, { from: address })
                    .then(async (data) => {
                        await propertyModelInst.updateProperty(propertyId, {rentAmount: details.rentAmount,securityDeposit: details.securityDeposit});
                        resolve(data);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }


    updateProperty(id, data) {
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.updateProperty(id, data);
    }
}


module.exports = PropertyService;
