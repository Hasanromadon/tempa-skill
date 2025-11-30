# ✅ Midtrans Integration Checklist

**Last Updated**: November 30, 2025  
**Documentation Reference**: https://docs.midtrans.com/reference/quick-start-1

---

## 📋 Integration Verification Status

### ✅ 1. Authorization (FIXED)

**Midtrans Requirement**:

- Format: `Authorization: Basic Base64({ServerKey}:)`
- Server Key as Username, empty Password
- Must include `:` (colon) at the end before base64 encoding

**Implementation**:

```go
// ✅ CORRECT IMPLEMENTATION (service.go line 413-416)
authString := s.midtransConfig.ServerKey + ":"
encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
httpReq.Header.Set("Authorization", "Basic "+encodedAuth)
```

**Previous Issue** (NOW FIXED):

```go
// ❌ OLD - Fake base64 encoding
httpReq.Header.Set("Authorization", "Basic "+s.encodeBase64(...))

func (s *paymentService) encodeBase64(str string) string {
    return "base64_encoded_string" // ❌ Hardcoded!
}
```

**Reference**: https://docs.midtrans.com/reference/authorization

---

### ✅ 2. Currency Format (FIXED)

**Midtrans Requirement**:

- Use **full Rupiah amount** (e.g., 499000 for Rp 499.000)
- **NOT cents** (tidak menggunakan 49900000)

**Implementation**:

```go
// ✅ CORRECT - Full Rupiah (service.go line 106-108)
TransactionDetails: MidtransTransactionDetail{
    OrderID:     orderID,
    GrossAmount: int64(course.Price), // 499000 = Rp 499.000
}

ItemDetails: []MidtransItemDetail{
    {
        Price:    int64(course.Price), // Same as gross_amount
        Quantity: 1,
    },
}
```

**Previous Issue** (NOW FIXED):

```go
// ❌ OLD - Multiplied by 100 (wrong!)
GrossAmount: int64(course.Price * 100), // 49900000 ❌
Price:       int64(course.Price * 100), // ❌
```

**Note**:

- Midtrans uses **Rupiah**, NOT cents like Stripe
- Database `course.price` is DECIMAL(10,2) = 499000.00
- Just convert to int64 without multiplication

---

### ✅ 3. API Endpoint

**Midtrans Requirement**:

- Sandbox: `https://api.sandbox.midtrans.com/v2/charge`
- Production: `https://api.midtrans.com/v2/charge`

**Implementation**:

```go
// ✅ CORRECT (service.go line 408)
url := s.midtransConfig.BaseURL + "/v2/charge"
```

**Environment Configuration** (.env):

```env
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com
```

---

### ✅ 4. Request Headers

**Midtrans Requirement**:

```
Content-Type: application/json
Accept: application/json
Authorization: Basic {Base64(ServerKey:)}
```

**Implementation**:

```go
// ✅ CORRECT (service.go line 411-416)
httpReq.Header.Set("Content-Type", "application/json")
httpReq.Header.Set("Accept", "application/json")
authString := s.midtransConfig.ServerKey + ":"
encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
httpReq.Header.Set("Authorization", "Basic "+encodedAuth)
```

---

### ✅ 5. Request Body (Bank Transfer)

**Midtrans Requirement** (Bank Transfer):

```json
{
  "payment_type": "bank_transfer",
  "transaction_details": {
    "order_id": "TS-12345678-1234567890",
    "gross_amount": 499000
  },
  "customer_details": {
    "first_name": "John Doe",
    "email": "john@example.com"
  },
  "item_details": [
    {
      "id": "course_1",
      "price": 499000,
      "quantity": 1,
      "name": "Pemrograman Web Modern"
    }
  ]
}
```

**Implementation**:

```go
// ✅ CORRECT (service.go line 101-117)
chargeReq := MidtransChargeRequest{
    PaymentType: "bank_transfer",
    TransactionDetails: MidtransTransactionDetail{
        OrderID:     orderID,
        GrossAmount: int64(course.Price),
    },
    CustomerDetails: MidtransCustomerDetail{
        FirstName: user.Name,
        Email:     user.Email,
    },
    ItemDetails: []MidtransItemDetail{
        {
            ID:       fmt.Sprintf("course_%d", req.CourseID),
            Price:    int64(course.Price),
            Quantity: 1,
            Name:     course.Title,
        },
    },
}
```

---

### ✅ 6. Response Handling

**Midtrans Response**:

- Success: HTTP 200 or 201
- Contains: `redirect_url`, `transaction_id`, `order_id`, `status_code`, etc.

**Implementation**:

```go
// ✅ CORRECT (service.go line 426-432)
if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
    return nil, fmt.Errorf("midtrans API error: %s", chargeResp.StatusMessage)
}
```

**Previous Issue** (NOW FIXED):

```go
// ❌ OLD - Only checked 200
if resp.StatusCode != http.StatusOK {
    // Midtrans might return 201 Created!
}
```

---

### ⚠️ 7. Bank Transfer Specific Configuration

**Requirement**:
For bank transfer, you may need to specify bank type:

```go
// OPTIONAL: Specify bank type
type MidtransBankTransfer struct {
    Bank string `json:"bank"` // bca, bni, bri, permata, etc.
}

chargeReq := MidtransChargeRequest{
    PaymentType: "bank_transfer",
    BankTransfer: &MidtransBankTransfer{
        Bank: "bca", // or "bni", "bri", "permata"
    },
    // ... other fields
}
```

**Current Status**: ❓ **NOT IMPLEMENTED YET**

- Currently using default bank transfer (Permata VA)
- May need to add bank selection in frontend

---

### ✅ 8. Webhook Signature Verification

**Midtrans Requirement**:

- Signature = SHA512(order_id + status_code + gross_amount + server_key)

**Implementation**:

```go
// ✅ CORRECT (service.go line 445-448)
func (s *paymentService) generateSignature(orderID, statusCode, grossAmount, serverKey string) string {
    hash := sha512.Sum512([]byte(orderID + statusCode + grossAmount + serverKey))
    return fmt.Sprintf("%x", hash)
}
```

---

### ✅ 9. Environment Configuration

**Sandbox Mode** (.env):

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-c2zpenmQQVNAYOVHtxrx0I-S
MIDTRANS_CLIENT_KEY=SB-Mid-client-ZBuTiayOZocEGgLJ
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com
# Merchant ID: G535083916
```

**Status**: ✅ **CONFIGURED CORRECTLY**

---

## 🔍 Testing Checklist

### Manual Testing Steps:

1. **Start Backend**:

   ```bash
   cd tempaskill-be
   go run cmd/api/main.go
   ```

2. **Create Payment** (Postman/curl):

   ```bash
   POST http://localhost:8080/api/v1/payments
   Authorization: Bearer {JWT_TOKEN}
   Content-Type: application/json

   {
     "course_id": 1,
     "payment_method": "bank_transfer"
   }
   ```

3. **Expected Response**:

   ```json
   {
     "message": "Payment created successfully",
     "data": {
       "order_id": "TS-12345678-1234567890",
       "payment_url": "https://simulator.sandbox.midtrans.com/...",
       "gross_amount": 499000,
       "transaction_status": "pending"
     }
   }
   ```

4. **Test Payment** (Sandbox):

   - Open `payment_url` in browser
   - Simulator Midtrans akan muncul
   - Pilih bank (BCA/BNI/BRI)
   - Copy nomor Virtual Account
   - Bayar menggunakan Midtrans Simulator

5. **Verify Webhook**:
   - Midtrans akan kirim notifikasi ke backend
   - Check database: `transaction_status` berubah jadi `settlement`
   - User auto-enrolled ke course

---

## 🐛 Common Errors & Solutions

### Error: "Unknown Merchant server_key/id"

**Causes**:

1. ❌ Server Key salah atau sudah revoked
2. ❌ Server Key tidak di-encode ke base64
3. ❌ Lupa tambahkan `:` setelah Server Key

**Solution**: ✅ **ALREADY FIXED**

- Menggunakan `base64.StdEncoding.EncodeToString()`
- Format: `{ServerKey}:` (dengan colon)

---

### Error: "gross_amount is not equal to the sum of item_details"

**Cause**:

- `transaction_details.gross_amount` ≠ `item_details[].price * quantity`

**Solution**: ✅ **ALREADY CORRECT**

```go
GrossAmount: int64(course.Price),  // 499000
Price:       int64(course.Price),  // 499000
Quantity:    1
// Total: 499000 * 1 = 499000 ✅
```

---

### Error: "Invalid gross_amount format"

**Cause**:

- Mengirim cents instead of Rupiah
- Contoh: 49900000 instead of 499000

**Solution**: ✅ **ALREADY FIXED**

- Tidak multiply by 100
- Langsung convert `int64(course.Price)`

---

## 📚 Documentation References

1. **Quick Start**: https://docs.midtrans.com/reference/quick-start-1
2. **Authorization**: https://docs.midtrans.com/reference/authorization
3. **Bank Transfer**: https://docs.midtrans.com/reference/payment-bank-transfer
4. **Core API Overview**: https://docs.midtrans.com/reference/core-api-overview
5. **Webhook Handling**: https://docs.midtrans.com/reference/notifications-handling

---

## 🎯 Next Steps

### Immediate (HIGH PRIORITY):

1. ✅ **Fix Base64 Encoding** - DONE
2. ✅ **Fix Currency Format** - DONE
3. ✅ **Fix Response Status Check** - DONE
4. 🔲 **Test Payment Creation** - PENDING
5. 🔲 **Test Webhook Notification** - PENDING

### Future Enhancements (MEDIUM PRIORITY):

1. 🔲 **Add Bank Selection**
   - Tambahkan dropdown di frontend untuk pilih bank
   - Update DTO untuk include `bank_transfer.bank` field
2. 🔲 **Add Payment Method Options**

   - GoPay
   - QRIS
   - Credit Card

3. 🔲 **Improve Error Handling**
   - Parse Midtrans error response
   - Show user-friendly error messages

### Production Readiness (BEFORE GOING LIVE):

1. 🔲 **Regenerate API Keys**

   - Revoke exposed Sandbox keys
   - Generate new Production keys
   - Update .env (NOT .env.example)

2. 🔲 **Clean Git History** (Optional)

   - Remove exposed keys from commit history
   - Use git filter-repo or BFG

3. 🔲 **Setup Webhook URL**

   - Configure webhook di Midtrans dashboard
   - Use HTTPS endpoint (e.g., https://api.tempaskill.com/api/v1/payments/webhook)

4. 🔲 **Test Production Environment**
   - Switch `MIDTRANS_IS_PRODUCTION=true`
   - Update `MIDTRANS_BASE_URL=https://api.midtrans.com`
   - Test dengan Production Server Key

---

## ✅ Summary

### Issues Fixed:

1. ✅ Base64 encoding menggunakan stdlib `encoding/base64`
2. ✅ Currency format menggunakan Rupiah penuh (tidak multiply by 100)
3. ✅ HTTP status check termasuk 201 Created
4. ✅ Authorization header format sesuai dokumentasi

### Current Status:

- **Build**: ✅ Passing
- **Configuration**: ✅ Sandbox mode
- **API Integration**: ✅ Sesuai dokumentasi
- **Testing**: ⏳ Ready to test

### Recommendation:

**Test payment creation sekarang!** Semua critical issues sudah diperbaiki sesuai dokumentasi Midtrans.

---

**Generated**: November 30, 2025  
**Version**: 1.0.0
