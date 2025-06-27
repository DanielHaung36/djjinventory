
import logo from "@/assets/img/logo.png";
interface InvoiceItem {
  id: string
  djjCode: string
  description: string
  detailDescription: string
  vinEngine: string
  quantity: number
  location?: string
  unitPrice?: number
  discount?: number
  subtotal?: number
}

interface InvoiceData {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyWebsite: string
  companyABN: string
  companyAddress: string
  invoiceNumber: string
  invoiceDate: string
  invoiceType: string
  billingAddress: string
  deliveryAddress: string
  customerCompany: string
  customerABN: string
  customerContact: string
  customerPhone: string
  customerEmail: string
  salesRep: string
  items: InvoiceItem[]
  bankName: string
  bsb: string
  accountNumber: string
  termsAndConditions: string
  subtotalAmount?: number
  gstAmount?: number
  totalAmount?: number
}

interface InvoicePreviewProps {
  data: InvoiceData
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const isQuote = data.invoiceType === "SALES QUOTE"
  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0)

  // 分页逻辑 - 每页最多显示 8 个产品项目
  const itemsPerPage = 8
  const pages = []
  for (let i = 0; i < data.items.length; i += itemsPerPage) {
    pages.push(data.items.slice(i, i + itemsPerPage))
  }

  const renderFullHeader = () => (
    <>
      {/* 头部 - Logo 和公司信息 */}
      <div style={{ display: "flex", marginBottom: "25px", alignItems: "flex-start" }}>
        {/* DJJ Logo */}
        <div style={{ width: "180px", marginRight: "30px" }}>
               <img
                src={logo}
                alt="DJJ Equipment"
                width={180}
                height={80}
                style={{ objectFit: "contain" }}
                className="object-contain"
                />
        </div>

        {/* 公司信息 */}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            {data.companyName}
          </h1>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    width: "55px",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    paddingBottom: "2px",
                    fontSize: "11px",
                    color: "#000",
                  }}
                >
                  Email:
                </td>
                <td style={{ verticalAlign: "top", paddingBottom: "2px", color: "#000", fontSize: "11px" }}>
                  {data.companyEmail}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "55px",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    paddingBottom: "2px",
                    fontSize: "11px",
                    color: "#000",
                  }}
                >
                  Phone:
                </td>
                <td style={{ verticalAlign: "top", paddingBottom: "2px", color: "#000", fontSize: "11px" }}>
                  {data.companyPhone}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "55px",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    paddingBottom: "2px",
                    fontSize: "11px",
                    color: "#000",
                  }}
                >
                  Website:
                </td>
                <td style={{ verticalAlign: "top", paddingBottom: "2px", color: "#000", fontSize: "11px" }}>
                  {data.companyWebsite}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "55px",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    paddingBottom: "2px",
                    fontSize: "11px",
                    color: "#000",
                  }}
                >
                  ABN:
                </td>
                <td style={{ verticalAlign: "top", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                  {data.companyABN}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "55px",
                    verticalAlign: "top",
                    fontWeight: "bold",
                    paddingBottom: "2px",
                    fontSize: "11px",
                    color: "#000",
                  }}
                >
                  Address:
                </td>
                <td style={{ verticalAlign: "top", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                  {data.companyAddress}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 发票类型标题 */}
      <div
        style={{
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "bold",
          margin: "15px 0",
          padding: "8px 0",
          borderTop: "2px solid #000",
          borderBottom: "2px solid #000",
          color: "#000",
        }}
      >
        {data.invoiceType}
      </div>

      {/* 客户信息区域 */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", paddingRight: "25px" }}>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        fontWeight: "bold",
                        width: "110px",
                        paddingBottom: "2px",
                        fontSize: "11px",
                        color: "#000",
                      }}
                    >
                      Billing Address:
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.billingAddress}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      Company:
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.customerCompany}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      {isQuote ? "Quote Number:" : "Invoice Number:"}
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      Contact:
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.customerContact}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      Email:
                    </td>
                    <td style={{ paddingBottom: "2px", color: "#000", fontSize: "11px" }}>{data.customerEmail}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ width: "50%", verticalAlign: "top" }}>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        fontWeight: "bold",
                        width: "110px",
                        paddingBottom: "2px",
                        fontSize: "11px",
                        color: "#000",
                      }}
                    >
                      Delivery Address:
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.deliveryAddress}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>ABN:</td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.customerABN}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      {isQuote ? "Quote Date:" : "Invoice Date:"}
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      Phone:
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.customerPhone}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", paddingBottom: "2px", fontSize: "11px", color: "#000" }}>
                      Sales Rep:
                    </td>
                    <td style={{ paddingBottom: "2px", fontSize: "11px", color: "#000" }}>{data.salesRep}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )

  const renderTableHeader = () => (
    <thead>
      <tr>
        <th
          style={{
            borderBottom: "3px solid #000",
            padding: "6px 4px",
            textAlign: "left",
            fontWeight: "bold",
            fontSize: "11px",
            width: "70px",
            color: "#000",
          }}
        >
          DJJ Code
        </th>
        <th
          style={{
            borderBottom: "3px solid #000",
            padding: "6px 4px",
            textAlign: "left",
            fontWeight: "bold",
            fontSize: "11px",
            color: "#000",
          }}
        >
          Product / Description
        </th>
        <th
          style={{
            borderBottom: "3px solid #000",
            padding: "6px 4px",
            textAlign: "left",
            fontWeight: "bold",
            fontSize: "11px",
            width: "50px",
            color: "#000",
          }}
        >
          {isQuote ? "VIN" : "VIN / Engine No."}
        </th>
        <th
          style={{
            borderBottom: "3px solid #000",
            padding: "6px 4px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11px",
            width: "35px",
            color: "#000",
          }}
        >
          Qty.
        </th>
        {isQuote && (
          <>
            <th
              style={{
                borderBottom: "3px solid #000",
                padding: "6px 4px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "11px",
                width: "80px",
                color: "#000",
              }}
            >
              Unit Price
            </th>
            <th
              style={{
                borderBottom: "3px solid #000",
                padding: "6px 4px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "11px",
                width: "70px",
                color: "#000",
              }}
            >
              Discount
            </th>
            <th
              style={{
                borderBottom: "3px solid #000",
                padding: "6px 4px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "11px",
                width: "80px",
                color: "#000",
              }}
            >
              Subtotal
            </th>
          </>
        )}
        {!isQuote && (
          <th
            style={{
              borderBottom: "3px solid #000",
              padding: "6px 4px",
              textAlign: "left",
              fontWeight: "bold",
              fontSize: "11px",
              width: "70px",
              color: "#000",
            }}
          >
            Location
          </th>
        )}
      </tr>
    </thead>
  )

  const renderTableRow = (item: InvoiceItem) => (
    <tr key={item.id}>
      <td
        style={{
          border: "1px solid #000",
          padding: "6px 4px",
          verticalAlign: "top",
          fontSize: "10px",
          color: "#000",
          fontWeight: "500",
        }}
      >
        {item.djjCode}
      </td>
      <td
        style={{
          border: "1px solid #000",
          padding: "6px 4px",
          verticalAlign: "top",
          fontSize: "10px",
          color: "#000",
        }}
      >
        {item.djjCode ? (
          <>
            <div style={{ fontWeight: "bold", marginBottom: "3px", color: "#000" }}>{item.description}</div>
            {item.detailDescription && (
              <div style={{ whiteSpace: "pre-line", fontSize: "9px", color: "#000" }}>{item.detailDescription}</div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontWeight: "bold", marginBottom: "3px", color: "#000" }}>- {item.description}</div>
            {item.detailDescription && (
              <div style={{ whiteSpace: "pre-line", fontSize: "9px", color: "#000" }}>{item.detailDescription}</div>
            )}
          </>
        )}
      </td>
      <td
        style={{
          border: "1px solid #000",
          padding: "6px 4px",
          verticalAlign: "top",
          fontSize: "10px",
          whiteSpace: "pre-line",
          color: "#000",
        }}
      >
        {item.vinEngine}
      </td>
      <td
        style={{
          border: "1px solid #000",
          padding: "6px 4px",
          verticalAlign: "top",
          textAlign: "center",
          fontSize: "10px",
          fontWeight: "bold",
          width: "35px",
          color: "#000",
        }}
      >
        {item.quantity}
      </td>
      {isQuote && (
        <>
          <td
            style={{
              border: "1px solid #000",
              padding: "6px 4px",
              verticalAlign: "top",
              textAlign: "right",
              fontSize: "10px",
              width: "80px",
              color: "#000",
            }}
          >
            ${item.unitPrice?.toLocaleString("en-AU", { minimumFractionDigits: 2 }) || "0.00"}
          </td>
          <td
            style={{
              border: "1px solid #000",
              padding: "6px 4px",
              verticalAlign: "top",
              textAlign: "right",
              fontSize: "10px",
              width: "70px",
              color: "#000",
            }}
          >
            ${item.discount?.toLocaleString("en-AU", { minimumFractionDigits: 2 }) || "0.00"}
          </td>
          <td
            style={{
              border: "1px solid #000",
              padding: "6px 4px",
              verticalAlign: "top",
              textAlign: "right",
              fontSize: "10px",
              fontWeight: "bold",
              width: "80px",
              color: "#000",
            }}
          >
            ${item.subtotal?.toLocaleString("en-AU", { minimumFractionDigits: 2 }) || "0.00"}
          </td>
        </>
      )}
      {!isQuote && (
        <td
          style={{
            border: "1px solid #000",
            padding: "6px 4px",
            verticalAlign: "top",
            fontSize: "10px",
            color: "#000",
          }}
        >
          {item.location}
        </td>
      )}
    </tr>
  )

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div
        className="bg-white text-black"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          lineHeight: "1.3",
          padding: "20px",
          color: "#000",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            style={{
              pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
              position: "relative",
              marginBottom: pageIndex < pages.length - 1 ? "40px" : "0",
              paddingBottom: pageIndex < pages.length - 1 ? "40px" : "0",
              borderBottom: pageIndex < pages.length - 1 ? "2px dashed #ccc" : "none",
            }}
          >
            {/* 第一页显示完整头部，后续页面不显示 */}
            {pageIndex === 0 && renderFullHeader()}

            {/* 产品表格 - 每页都有表头 */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "12px",
                marginTop: pageIndex > 0 ? "20px" : "0",
              }}
            >
              {renderTableHeader()}
              <tbody>{pageItems.map(renderTableRow)}</tbody>
            </table>

            {/* 最后一页显示总计和其他信息 */}
            {pageIndex === pages.length - 1 && (
              <>
                {/* 总数量或价格总计 */}
                {isQuote ? (
                  <div style={{ textAlign: "right", marginBottom: "20px" }}>
                    <table style={{ marginLeft: "auto", borderCollapse: "collapse", fontSize: "11px" }}>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              fontWeight: "bold",
                              padding: "6px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              color: "#000",
                            }}
                          >
                            Subtotal:
                          </td>
                          <td
                            style={{
                              fontWeight: "bold",
                              padding: "6px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              minWidth: "90px",
                              color: "#000",
                            }}
                          >
                            ${data.subtotalAmount?.toLocaleString("en-AU", { minimumFractionDigits: 2 }) || "0.00"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              fontWeight: "bold",
                              padding: "6px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              color: "#000",
                            }}
                          >
                            GST:
                          </td>
                          <td
                            style={{
                              fontWeight: "bold",
                              padding: "6px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              color: "#000",
                            }}
                          >
                            ${data.gstAmount?.toLocaleString("en-AU", { minimumFractionDigits: 2 }) || "0.00"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              fontWeight: "bold",
                              padding: "6px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              color: "#000",
                            }}
                          >
                            Total:
                          </td>
                          <td
                            style={{
                              fontWeight: "bold",
                              padding: "6px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              color: "#000",
                            }}
                          >
                            ${data.totalAmount?.toLocaleString("en-AU", { minimumFractionDigits: 2 }) || "0.00"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "right",
                      marginBottom: "20px",
                      display: "inline-block",
                      float: "right",
                      fontSize: "11px",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "#000" }}>Total Qty: </span>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        color: "#000",
                        backgroundColor: "rgb(227, 223, 223)",
                        padding: "3px 6px",
                        border: "1px solid #ccc",
                      }}
                    >
                      {totalQuantity}
                    </span>
                  </div>
                )}

                <div style={{ clear: "both", marginBottom: "15px" }}></div>

                {/* 条款和条件 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "12px", color: "#000" }}>
                    Terms & Conditions:
                  </h3>
                  <div style={{ fontSize: "9px", lineHeight: "1.3", color: "#000" }}>
                    <div style={{ marginBottom: "6px" }}>
                      <strong>Acceptance</strong>
                      <div>
                        • Payment of any amount confirms acceptance of these Terms and forms a binding agreement.
                      </div>
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                      <strong>Payment</strong>
                      <div>• A deposit is required to confirm the order.</div>
                      <div>• Deposits are non-refundable, unless otherwise agreed in writing in advance.</div>
                      <div>• Full payment must be received before dispatch.</div>
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                      <strong>Cancellation</strong>
                      <div>
                        • If the order is cancelled after confirmation, DJJ Equipment may charge reasonable costs
                        incurred.
                      </div>
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                      <strong>Order Changes</strong>
                      <div>• Changes must be approved in writing.</div>
                      <div>• May result in additional charges or revised timelines.</div>
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                      <strong>Pricing</strong>
                      <div>
                        • Subject to change based on supplier pricing, import duties, and exchange rates prior to
                        delivery.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 支付详情 */}
                <div
                  style={{
                    borderTop: "1px solid #000",
                    paddingTop: "12px",
                  }}
                >
                  <h3 style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "11px", color: "#000" }}>
                    EFT Payment Details:
                  </h3>
                  <table style={{ fontSize: "10px" }}>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: "bold", width: "70px", paddingBottom: "1px", color: "#000" }}>
                          Name:
                        </td>
                        <td style={{ paddingBottom: "1px", color: "#000" }}>{data.bankName}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold", paddingBottom: "1px", color: "#000" }}>BSB:</td>
                        <td style={{ paddingBottom: "1px", color: "#000" }}>{data.bsb}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold", paddingBottom: "1px", color: "#000" }}>Acct No.:</td>
                        <td style={{ paddingBottom: "1px", color: "#000" }}>{data.accountNumber}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold", paddingBottom: "1px", color: "#000" }}>Ref.:</td>
                        <td style={{ paddingBottom: "1px", color: "#000" }}>{data.invoiceNumber}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* 页脚 - 页码 */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "9px",
                color: "#666",
              }}
            >
              {pageIndex + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
