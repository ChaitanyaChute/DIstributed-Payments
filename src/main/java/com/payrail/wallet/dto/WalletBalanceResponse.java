package com.payrail.wallet.dto;

import java.math.BigDecimal;

public record WalletBalanceResponse(
        Long walletId,
        String email,
        BigDecimal balance
) {}
