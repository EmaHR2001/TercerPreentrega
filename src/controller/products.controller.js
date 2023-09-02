const ProductServices = require("../dao/mongo/services/products.services");
const Service = new ProductServices();
const { CustomError } = require('../services/errors/customErrors')
const EErrors = require('../services/errors/enums')
const { addProductErrorInfo, delProductError, updateProductError } = require('../services/errors/info')


const getProducts = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const dataproduct = await Service.getAll(page, limit);

    return res.status(200).json({
      status: "success",
      payload: dataproduct.docs,
      totalPages: dataproduct.totalPages,
      prevPages: dataproduct.prevPage,
      nextPages: dataproduct.nextPage,
      page: dataproduct.page,
      hasPrevPage: dataproduct.hasPrevPage,
      hasNextPage: dataproduct.hasNextPage,
      prevLink: dataproduct.hasPrevPage
        ? `http://localhost:8080/dataproduct/?page=${dataproduct.prevPage} `
        : null,
      nextLink: dataproduct.hasNextPage
        ? `http://localhost:8080/dataproduct/?page=${dataproduct.nextPage} `
        : null,

    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      msg: "something went wrong :(",
      data: {},
    });
  }
}
const getProductsById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Service.getById(id);
    return product
      ? res.status(200).json({
        status: "success",
        msg: "Product Get by ID",
        data: product,
      })
      : res.status(200).json({
        status: "error",
        msg: "Product not found",
        data: product,
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "error",
      msg: "something went wrong :(",
      data: {},
    });
  }
}
const postProduct = async (req, res) => {
  try {
    const data = req.body;
    const productCreated = await Service.createOne(data);
    return res.status(201).json({
      status: "success",
      msg: "product created",
      data: productCreated,
    });
  } catch (e) {
    const data = req.body;
    const error = CustomError.createError({
      name: 'Error al crear producto.',
      cause: addProductErrorInfo(data),
      message: 'Error al intentar crear producto.',
      code: EErrors.ADD_PRODUCT_ERROR
    });
  }
}

const postManyProducts = async (req, res) => {
  try {
    const data = req.body;
    const productCreated = await Service.createMany(data);
    return res.status(201).json({
      status: "success",
      msg: "product created",
      data: productCreated,
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      msg: "something went wrong :(",
      data: {},
    });
  }
}
const delProductById = async (req, res) => {
  console.log("codigo:", EErrors.DEL_PRODUCT_ERROR)
  try {
    const { id } = req.params;
    await Service.deletedOne(id);
    return res.status(200).json({
      status: "success",
      msg: "Product deleted",
      data: {},
    });
  } catch (e) {
    const { id } = req.params
    const error = CustomError.createError({
      name: 'Error al eliminar producto.',
      cause: delProductError(id),
      message: 'Error al intentar eliminar producto.',
      code: EErrors.DEL_PRODUCT_ERROR
    });
  }
}
const putProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingProduct = await Service.getById(id);

    if (!existingProduct) {
      const error = CustomError.createError({
        name: 'Error al buscar en la base producto.',
        cause: updateProductError(id),
        message: 'Error al buscar en la base producto.',
        code: EErrors.UPDATE_PRODUCT_ERROR
      });
    }
    const fieldsToUpdate = ["title", "description", "thumbnail", "price", "code", "stock", "category", "status"];

    for (const field of fieldsToUpdate) {
      if (data[field] !== '') {
        existingProduct[field] = data[field];
      }
    }
    await existingProduct.save();

    return res.status(201).json({
      status: "success",
      msg: "Producto actualizado",
      data: existingProduct,
    });
  } catch (e) {
    const { id } = req.params
    const error = CustomError.createError({
      name: 'Error al intentar actualizar producto.',
      cause: updateProductError(id),
      message: 'Error al intentar actualizar producto.',
      code: EErrors.UPDATE_PRODUCT_ERROR
    });
  }
}
const getProductError = () => {
  res.render("error404", {
    style: "error404.css",
    title: "Error 404",
  });
}

module.exports = {
  getProducts,
  getProductsById,
  postProduct,
  postManyProducts,
  delProductById,
  putProductById,
  getProductError
}