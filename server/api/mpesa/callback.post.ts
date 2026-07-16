import { eq } from "drizzle-orm";
import db from "~~/server/db";
import { formPayments } from "~~/server/db/schema";
import { completeFormPayment } from "~~/server/services/payment.service";
import type { StkCallbackHook } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  try {
    const hook = (await readBody(event)) as StkCallbackHook;
    const callback = hook.Body.stkCallback;
    if (!callback) {
      throw createError({
        statusCode: 400,
        message: "No callback found",
      });
    }
    console.log(hook);

    const result = await completeFormPayment(hook);

    // Only process successful payments for form submissions
    if (callback.ResultCode === 0 && result) {
      await handleSuccessfulPayment(result);
    } else if (callback.ResultCode !== 0 && result) {
      await handleFailedPayment(result);
    }
  } catch (e: any) {
    console.log("Unable To Process Payment", e.message);
  }
});

async function handleSuccessfulPayment(updatedPayment: any) {
  try {
    // Get the form payment to find the submission
    const formPayment = await db.query.formPayments.findFirst({
      where: eq(formPayments.paymentId, updatedPayment.id),
      with: {
        submission: {
          with: {
            responses: {
              with: {
                field: true,
              },
            },
            form: true,
            submitter: true,
          },
        },
      },
    });

    if (!formPayment?.submission) {
      console.log("No submission found for payment:", updatedPayment.id);
      return;
    }

    // const submission = formPayment.submission;
    // const form = formPayment.submission.form;

    // // Stop TAT for the submission after successful payment
    // try {
    // 	await stopSubmissionTAT(submission.id);
    // 	console.log("TAT stopped for submission:", submission.id);
    // } catch (tatError) {
    // 	console.error("Failed to stop TAT for submission:", submission.id, tatError);
    // }

    // // Send stop TAT notification (SMS with token and/or email)
    // const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
    // const token = submission.metadata?.accessToken;
    // const stopTatUrl = token
    //   ? `${baseUrl}/submission/${submission.id}/stop-tat?token=${token}`
    //   : `${baseUrl}/submission/${submission.id}/stop-tat`;
    //
    // // Send SMS with stop TAT link
    // try {
    //   const smsMessage = `Payment successful for "${form.title}". Your submission has been processed. Stop TAT: ${stopTatUrl}`;
    //   await sendTextSmsTiara({
    //     phone: updatedPayment.phoneNumber,
    //     message: smsMessage,
    //   });
    // } catch (smsError) {
    //   console.error("Failed to send payment confirmation SMS:", smsError);
    // }
    //
    // // Send email if submitter has email
    // if (submission.submitter?.email) {
    //   try {
    //     await sendStopTatNotification(submission.submitter.email, form.title, stopTatUrl);
    //   } catch (emailError) {
    //     console.error("Failed to send stop TAT notification email:", emailError);
    //   }
    // }
    //
    // // Also check for email in form responses in case submitter is not logged in
    // if (!submission.submitter?.email && submission.responses) {
    //   const emailResponse = submission.responses.find((response) => {
    //     const value = response.value?.toString().toLowerCase();
    //     return value && value.includes("@") && value.includes(".");
    //   });
    //
    //   if (emailResponse?.value) {
    //     try {
    //       await sendStopTatNotification(emailResponse.value, form.title, stopTatUrl);
    //     } catch (emailError) {
    //       console.error("Failed to send stop TAT notification to response email:", emailError);
    //     }
    //   }
    // }
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(updatedPayment: any) {
  try {
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
