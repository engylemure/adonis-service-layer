const { ErrorCodeException } = require('@conceptho/exceptions');
const { ServiceResponse } = require('@conceptho/services');

const Model = require('@adonisjs/lucid/src/Lucid/Model');
const QueryBuilder = require('@adonisjs/lucid/src/Lucid/QueryBuilder');

/**
 * Resourceful controller for interacting with bases
 */
class BaseController {
  applyExpand({ data, expand, blackList = [], whiteList = [] }) {
    let expandArray = expand;
    let expandedData = data;

    if (typeof expandArray === 'string') {
      expandArray = expandArray.replace(/ /g, '').split(',');
    }

    if (expandArray && expandArray instanceof Array) {
      expandArray = [...new Set(expandArray)].filter(value => !blackList.includes(value) && whiteList.includes(value));

      if (expandedData instanceof Model) {
        return data.loadMany(expandArray);
      }
      if (expandedData instanceof QueryBuilder) {
        for (const i in expandArray) {
          expandedData = expandedData.with(expandArray[i]);
        }
      }
    }

    return expandedData;
  }

  async verifyServiceResponse({ response, serviceResponse, callbackWhenIsOk = async () => {} }) {
    const { isOk, data } = serviceResponse;

    if (serviceResponse instanceof ServiceResponse) {
      if (isOk) {
        if (data) {
          await callbackWhenIsOk(data);

          return data;
        }

        return response.noContent();
      }

      throw new ErrorCodeException(400, data);
    }

    throw new ErrorCodeException(500, data);
  }
}

export default BaseController;
