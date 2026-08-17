"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppHref } from "@/components/app-base-path";
import { fieldClassName, FormField } from "@/components/form-field";
import { MediaPreview } from "@/components/media-preview";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { BrandPostFeed } from "@/components/brand-post-feed";
import { UpgradeAlert } from "@/components/upgrade-alert";
import {
  BRAND_CONTENT_KINDS,
  DEFAULT_IMAGE_AI,
  IMAGE_AI_MODELS,
  IMAGE_ASPECTS,
  MAX_BRAND_POST_IMAGES,
  MAX_PLAN_DAYS,
  MAX_POSTS_PER_DAY,
  MIN_PLAN_DAYS,
  MIN_POSTS_PER_DAY,
  PLAN_PLATFORMS,
  clampPostsPerDay,
  defaultBrandContentMix,
  planTotalPosts,
  type BrandContentMix,
} from "@/lib/plan-options";
import { toIsoFromLocal, toLocalInput } from "@/lib/datetime-local";
import type {
  BrandPlan,
  BrandPost,
  BrandPostMedia,
  FacebookPageOption,
} from "@/lib/types";

type BrandPlanPanelProps = {
  brandId: string;
  hasLogo: boolean;
  plans: BrandPlan[];
  pages: FacebookPageOption[];
  defaultImageAi: string;
  maxPlanDays?: number;
  billingPlan?: "FREE" | "STARTER" | "PRO";
};

type PostSort = "scheduled" | "created";
type PostViewMode = "list" | "single";
type KindFilter = "all" | "TEXT" | "IMAGE" | "VIDEO" | "INFOGRAPHIC";

const KIND_VALUES = new Set(["TEXT", "IMAGE", "VIDEO", "INFOGRAPHIC"]);

const parseKindFilter = (value: string | null): KindFilter => {
  const raw = value?.trim().toUpperCase() ?? "";
  return KIND_VALUES.has(raw) ? (raw as KindFilter) : "all";
};

const parsePostSort = (value: string | null): PostSort =>
  value?.trim().toLowerCase() === "created" ? "created" : "scheduled";

const parsePostViewMode = (value: string | null): PostViewMode =>
  value?.trim().toLowerCase() === "single" ? "single" : "list";

const isArchivedPlan = (plan: BrandPlan) => plan.status === "ARCHIVED";
const isArchivedPost = (post: BrandPost) => post.status === "ARCHIVED";

type PostEdit = {
  kind: string;
  title: string;
  caption: string;
  hashtags: string;
  notes: string;
  imagePrompt: string;
  imageAspect: string;
  pageId: string;
  pageName: string;
  scheduledAt: string;
  imageModelValue: string;
};

type PlanForm = BrandContentMix & {
  name: string;
  days: number;
  postsPerDay: number;
  platforms: string[];
  startDate: string;
  brief: string;
  imageModelValue: string;
};

const todayIso = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const buildForm = (hasLogo: boolean): PlanForm => {
  const days = 7;
  const postsPerDay = 1;
  return {
    name: "",
    days,
    postsPerDay,
    platforms: ["facebook"],
    startDate: todayIso(),
    brief: "",
    imageModelValue: DEFAULT_IMAGE_AI,
    ...defaultBrandContentMix(planTotalPosts(days, postsPerDay), !hasLogo),
  };
};

const planLabel = (plan: BrandPlan) => {
  const named = plan.name.trim();
  if (named) {
    return named;
  }
  if (plan.brief.trim()) {
    return plan.brief.trim().slice(0, 48);
  }
  return `Plan ${plan.startDate.slice(0, 10)}`;
};

const parseHashtags = (value: string) =>
  value
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)
    .slice(0, 30);

const toPostEdit = (post: BrandPost, imageModelValue: string): PostEdit => ({
  kind: post.kind,
  title: post.title,
  caption: post.caption,
  hashtags: (post.hashtags ?? []).join(", "),
  notes: post.notes ?? "",
  imagePrompt: post.imagePrompt ?? "",
  imageAspect: post.imageAspect || "9:16",
  pageId: post.pageId ?? "",
  pageName: post.pageName ?? "",
  scheduledAt: toLocalInput(post.plannedAt),
  imageModelValue,
});

const isVisualKind = (kind: string) =>
  kind === "IMAGE" || kind === "VIDEO" || kind === "INFOGRAPHIC";

const canUploadImages = (kind: string) =>
  kind === "IMAGE" || kind === "INFOGRAPHIC";

const postImages = (post: BrandPost) =>
  (post.media ?? []).filter((item) => item.type === "IMAGE");

const chipClass = (active: boolean) =>
  `rounded-lg px-2.5 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    active
      ? "bg-accent text-[color:var(--button-ink)]"
      : "text-muted hover:text-ink"
  }`;

const aspectHint = (value: string) =>
  IMAGE_ASPECTS.find((item) => item.value === value)?.hint ??
  IMAGE_ASPECTS[0]!.hint;

const ImageAiSelect = ({
  id,
  value,
  onChange,
  ariaLabel,
  allowGemini,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  allowGemini: boolean;
}) => {
  const models = allowGemini
    ? IMAGE_AI_MODELS
    : IMAGE_AI_MODELS.filter((item) => item.group !== "Google");
  const groups = [...new Set(models.map((item) => item.group))];
  const selected =
    models.some((item) => item.value === value) ? value : DEFAULT_IMAGE_AI;

  return (
    <select
      id={id}
      value={selected}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClassName}
      aria-label={ariaLabel}
    >
      {groups.map((group) => (
        <optgroup key={group} label={group}>
          {models
            .filter((item) => item.group === group)
            .map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
};

export const BrandPlanPanel = ({
  brandId,
  hasLogo,
  plans,
  pages,
  defaultImageAi,
  maxPlanDays = MAX_PLAN_DAYS,
  billingPlan = "FREE",
}: BrandPlanPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appHref = useAppHref();
  const brandHref = appHref(`/brands/${brandId}`);
  const planDayMax = Math.min(MAX_PLAN_DAYS, Math.max(MIN_PLAN_DAYS, maxPlanDays));
  const kindFilter = parseKindFilter(searchParams.get("kind"));
  const postSort = parsePostSort(searchParams.get("sort"));
  const postViewMode = parsePostViewMode(searchParams.get("mode"));
  const showArchived = searchParams.get("archived") === "1";
  const planParam = searchParams.get("plan")?.trim() ?? "";
  const showAllPlans = !planParam || planParam === "all";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>(() => {
    const initial = buildForm(hasLogo);
    const days = Math.min(initial.days, Math.min(MAX_PLAN_DAYS, Math.max(MIN_PLAN_DAYS, maxPlanDays)));
    return {
      ...initial,
      days,
      imageModelValue: defaultImageAi,
      ...defaultBrandContentMix(planTotalPosts(days, initial.postsPerDay), !hasLogo),
    };
  });
  const [planSearch, setPlanSearch] = useState("");
  const [singleIndex, setSingleIndex] = useState(0);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PostEdit | null>(null);
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [regeneratingPostId, setRegeneratingPostId] = useState<string | null>(
    null,
  );
  const [generatingPostId, setGeneratingPostId] = useState<string | null>(null);
  const [uploadingPostId, setUploadingPostId] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<BrandPostMedia | null>(null);
  const [postError, setPostError] = useState("");
  const [postErrorCode, setPostErrorCode] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [confirmSpec, setConfirmSpec] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    busyLabel: string;
    tone: "default" | "danger";
    run: () => Promise<void>;
  } | null>(null);
  const [confirmError, setConfirmError] = useState("");
  const allowGemini = billingPlan !== "FREE";
  const safeImageModelValue = (value: string) =>
    allowGemini || !value.startsWith("gemini:") ? value : DEFAULT_IMAGE_AI;

  const total = planTotalPosts(form.days, form.postsPerDay);
  const mixSum = form.text + form.image + form.video + form.infographic;

  const setQueryPatch = (patch: Record<string, string | null | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", "plans");
    for (const [key, raw] of Object.entries(patch)) {
      const value = typeof raw === "string" ? raw.trim() : "";
      const omitDefault =
        !value ||
        (key === "kind" && value === "all") ||
        (key === "sort" && value === "scheduled") ||
        (key === "mode" && value === "list") ||
        (key === "plan" && value === "all") ||
        (key === "archived" && value !== "1");
      if (omitDefault) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    const query = next.toString();
    router.replace(query ? `${brandHref}?${query}` : brandHref, {
      scroll: false,
    });
  };

  const sorted = useMemo(
    () =>
      [...plans].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [plans],
  );

  const scopedPlans = useMemo(
    () =>
      sorted.filter((plan) =>
        showArchived
          ? isArchivedPlan(plan) || plan.posts.some(isArchivedPost)
          : !isArchivedPlan(plan),
      ),
    [showArchived, sorted],
  );

  const filteredPlans = useMemo(() => {
    const query = planSearch.trim().toLowerCase();
    if (!query) {
      return scopedPlans;
    }
    return scopedPlans.filter((plan) =>
      `${planLabel(plan)} ${plan.brief}`.toLowerCase().includes(query),
    );
  }, [planSearch, scopedPlans]);

  const selected =
    filteredPlans.find((plan) => plan.id === planParam) ??
    (!showAllPlans ? filteredPlans[0] ?? null : null);

  const displayPosts = useMemo(() => {
    const sourcePlans = showAllPlans
      ? filteredPlans
      : selected
        ? [selected]
        : [];
    const rows: BrandPost[] = [];
    for (const plan of sourcePlans) {
      for (const post of plan.posts) {
        if (showArchived) {
          if (!isArchivedPlan(plan) && !isArchivedPost(post)) {
            continue;
          }
        } else if (isArchivedPost(post)) {
          continue;
        }
        if (kindFilter !== "all" && post.kind !== kindFilter) {
          continue;
        }
        rows.push(post);
      }
    }
    rows.sort((a, b) => {
      if (postSort === "created") {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }
      const aTime = a.plannedAt
        ? new Date(a.plannedAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.plannedAt
        ? new Date(b.plannedAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
    return rows;
  }, [filteredPlans, kindFilter, postSort, selected, showAllPlans, showArchived]);

  const safeSingleIndex =
    displayPosts.length === 0
      ? 0
      : Math.min(singleIndex, displayPosts.length - 1);

  const postsByDay = useMemo(() => {
    const groups = new Map<number, BrandPost[]>();
    for (const post of displayPosts) {
      const current = groups.get(post.dayIndex) ?? [];
      current.push(post);
      groups.set(post.dayIndex, current);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [displayPosts]);

  const handleScaleMix = (days: number, postsPerDay: number) => {
    const nextDays = Math.min(planDayMax, Math.max(MIN_PLAN_DAYS, days));
    setForm((current) => ({
      ...current,
      days: nextDays,
      postsPerDay,
      ...defaultBrandContentMix(
        planTotalPosts(nextDays, postsPerDay),
        !hasLogo,
      ),
    }));
  };

  const handleOpenModal = () => {
    setError("");
    setErrorCode("");
    const initial = buildForm(hasLogo);
    const days = Math.min(initial.days, planDayMax);
    setForm({
      ...initial,
      days,
      imageModelValue: defaultImageAi,
      ...defaultBrandContentMix(
        planTotalPosts(days, initial.postsPerDay),
        !hasLogo,
      ),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleTogglePlatform = (value: string) => {
    setForm((current) => {
      const hasPlatform = current.platforms.includes(value);
      return {
        ...current,
        platforms: hasPlatform
          ? current.platforms.filter((item) => item !== value)
          : [...current.platforms, value],
      };
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setErrorCode("");
    if (form.platforms.length < 1) {
      setError("Select at least one platform.");
      return;
    }
    if (mixSum !== total) {
      setError(`Mix must sum to ${total} posts.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/brands/${brandId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          days: form.days,
          postsPerDay: form.postsPerDay,
          platforms: form.platforms,
          startDate: form.startDate,
          brief: form.brief,
          mix: {
            text: form.text,
            image: form.image,
            video: form.video,
            infographic: form.infographic,
          },
          imageModelValue: safeImageModelValue(form.imageModelValue),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        code?: string;
        planId?: string;
        needsAssets?: boolean;
      };
      if (!response.ok || !data.planId) {
        setError(data.error ?? "Could not generate the plan.");
        setErrorCode(data.code ?? "");
        return;
      }

      setQueryPatch({ plan: data.planId, archived: null });

      if (data.needsAssets) {
        const assetsResponse = await fetch(
          `/api/brands/${brandId}/plans/${data.planId}/generate-assets`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageModelValue: safeImageModelValue(form.imageModelValue),
            }),
          },
        );
        const assetsData = (await assetsResponse.json()) as {
          error?: string;
          code?: string;
        };
        if (!assetsResponse.ok) {
          setError(
            assetsData.error ??
              "Plan created, but image generation failed. You can retry from Posts.",
          );
          setErrorCode(assetsData.code ?? "");
          return;
        }
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectKind = (value: KindFilter) => {
    setQueryPatch({ kind: value });
    setSingleIndex(0);
    handleCloseEdit();
  };

  const handleSelectSort = (value: PostSort) => {
    setQueryPatch({ sort: value });
    setSingleIndex(0);
    handleCloseEdit();
  };

  const handleSelectView = (value: PostViewMode) => {
    setQueryPatch({ mode: value });
    setSingleIndex(0);
    handleCloseEdit();
  };

  const handleToggleArchived = () => {
    setQueryPatch({
      archived: showArchived ? null : "1",
      plan: "all",
    });
    setSingleIndex(0);
    handleCloseEdit();
  };

  const handleCloseConfirm = () => {
    if (statusBusyId) {
      return;
    }
    setConfirmSpec(null);
    setConfirmError("");
  };

  const handleRunConfirm = async () => {
    if (!confirmSpec) {
      return;
    }
    setConfirmError("");
    try {
      await confirmSpec.run();
      setConfirmSpec(null);
    } catch (caught) {
      setConfirmError(
        caught instanceof Error ? caught.message : "Could not complete that action.",
      );
    }
  };

  const handleArchivePlan = (plan: BrandPlan) => {
    const restoring = isArchivedPlan(plan);
    setConfirmError("");
    setConfirmSpec({
      title: restoring ? "Restore content plan" : "Archive content plan",
      description: restoring
        ? `Restore “${planLabel(plan)}” back to your active plans?`
        : `Archive “${planLabel(plan)}”? You can restore it later from Archived.`,
      confirmLabel: restoring ? "Restore plan" : "Archive plan",
      busyLabel: restoring ? "Restoring…" : "Archiving…",
      tone: "default",
      run: async () => {
        const nextStatus = restoring ? "READY" : "ARCHIVED";
        setStatusBusyId(plan.id);
        try {
          const response = await fetch(
            `/api/brands/${brandId}/plans/${plan.id}/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: nextStatus }),
            },
          );
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error ?? "Could not update the plan.");
          }
          if (nextStatus === "ARCHIVED") {
            setQueryPatch({ plan: "all" });
          } else {
            setQueryPatch({ archived: null, plan: plan.id });
          }
          router.refresh();
        } finally {
          setStatusBusyId(null);
        }
      },
    });
  };

  const handleDeletePlan = (plan: BrandPlan) => {
    setConfirmError("");
    setConfirmSpec({
      title: "Delete content plan",
      description: `Permanently delete “${planLabel(plan)}” and its posts? This cannot be undone.`,
      confirmLabel: "Delete plan",
      busyLabel: "Deleting…",
      tone: "danger",
      run: async () => {
        setStatusBusyId(plan.id);
        try {
          const response = await fetch(
            `/api/brands/${brandId}/plans/${plan.id}`,
            { method: "DELETE" },
          );
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error ?? "Could not delete the plan.");
          }
          setQueryPatch({ plan: "all" });
          handleCloseEdit();
          router.refresh();
        } finally {
          setStatusBusyId(null);
        }
      },
    });
  };

  const handleArchivePost = (post: BrandPost) => {
    const restoring = isArchivedPost(post);
    setConfirmError("");
    setConfirmSpec({
      title: restoring ? "Restore post" : "Archive post",
      description: restoring
        ? "Restore this post back to the active content plan?"
        : `Archive this ${post.kind.toLowerCase()} post? You can restore it later from Archived.`,
      confirmLabel: restoring ? "Restore post" : "Archive post",
      busyLabel: restoring ? "Restoring…" : "Archiving…",
      tone: "default",
      run: async () => {
        const nextStatus = restoring
          ? post.plannedAt
            ? "PLANNED"
            : "DRAFT"
          : "ARCHIVED";
        setStatusBusyId(post.id);
        try {
          const response = await fetch(
            `/api/brands/${brandId}/posts/${post.id}/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: nextStatus }),
            },
          );
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error ?? "Could not update the post.");
          }
          handleCloseEdit();
          router.refresh();
        } finally {
          setStatusBusyId(null);
        }
      },
    });
  };

  const handleDeletePost = (post: BrandPost) => {
    setConfirmError("");
    setConfirmSpec({
      title: "Delete post",
      description: `Permanently delete this ${post.kind.toLowerCase()} post? This cannot be undone.`,
      confirmLabel: "Delete post",
      busyLabel: "Deleting…",
      tone: "danger",
      run: async () => {
        setStatusBusyId(post.id);
        try {
          const response = await fetch(
            `/api/brands/${brandId}/posts/${post.id}`,
            { method: "DELETE" },
          );
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error ?? "Could not delete the post.");
          }
          handleCloseEdit();
          router.refresh();
        } finally {
          setStatusBusyId(null);
        }
      },
    });
  };

  const handleOpenEdit = (post: BrandPost) => {
    setPostError("");
    setEditingPostId(post.id);
    const draft = toPostEdit(post, defaultImageAi);
    if (!draft.pageId && pages[0]) {
      draft.pageId = pages[0].id;
      draft.pageName = pages[0].name;
    }
    setEditDraft(draft);
  };

  const handleCloseEdit = () => {
    setEditingPostId(null);
    setEditDraft(null);
    setPostError("");
  };

  const handleSavePost = async (post: BrandPost) => {
    if (!editDraft) {
      return;
    }
    setPostError("");
    setSavingPostId(post.id);
    try {
      const response = await fetch(`/api/brands/${brandId}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: editDraft.kind,
          title: editDraft.title,
          caption: editDraft.caption,
          imagePrompt: editDraft.imagePrompt,
          imageAspect: editDraft.imageAspect,
          imageModelValue: safeImageModelValue(editDraft.imageModelValue),
          notes: editDraft.notes,
          hashtags: parseHashtags(editDraft.hashtags),
          pageId: editDraft.pageId || null,
          pageName:
            pages.find((page) => page.id === editDraft.pageId)?.name ??
            editDraft.pageName,
          plannedAt: toIsoFromLocal(editDraft.scheduledAt),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPostError(data.error ?? "Could not save post.");
        return;
      }
      handleCloseEdit();
      router.refresh();
    } catch {
      setPostError("Could not reach wil. Try again.");
    } finally {
      setSavingPostId(null);
    }
  };

  const handleRegeneratePrompt = async (post: BrandPost) => {
    if (!editDraft) {
      return;
    }
    if (!isVisualKind(editDraft.kind)) {
      setPostError("Switch type to Image, Video, or Infographic first.");
      return;
    }
    setPostError("");
    setRegeneratingPostId(post.id);
    try {
      const response = await fetch(
        `/api/brands/${brandId}/posts/${post.id}/regenerate-prompt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: editDraft.kind,
            title: editDraft.title,
            caption: editDraft.caption,
            imagePrompt: editDraft.imagePrompt,
            imageAspect: editDraft.imageAspect,
          }),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        imagePrompt?: string;
      };
      if (!response.ok || !data.imagePrompt) {
        setPostError(data.error ?? "Could not regenerate prompt.");
        return;
      }
      setEditDraft((current) =>
        current ? { ...current, imagePrompt: data.imagePrompt ?? "" } : current,
      );
    } catch {
      setPostError("Could not reach wil. Try again.");
    } finally {
      setRegeneratingPostId(null);
    }
  };

  const handleGeneratePlanAssets = async (id: string) => {
    setPostError("");
    setPostErrorCode("");
    setGeneratingPlan(true);
    try {
      const response = await fetch(
        `/api/brands/${brandId}/plans/${id}/generate-assets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageModelValue: safeImageModelValue(defaultImageAi),
          }),
        },
      );
      const data = (await response.json()) as { error?: string; code?: string };
      if (!response.ok) {
        setPostError(data.error ?? "Could not generate assets.");
        setPostErrorCode(data.code ?? "");
        return;
      }
      router.refresh();
    } catch {
      setPostError("Could not reach wil. Try again.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGenerateAssets = async (post: BrandPost) => {
    if (!editDraft) {
      return;
    }
    if (!isVisualKind(editDraft.kind)) {
      setPostError("Switch type to Image, Video, or Infographic first.");
      return;
    }
    if (!hasLogo) {
      setPostError("Upload a brand logo on Kit before generating images.");
      return;
    }
    setPostError("");
    setGeneratingPostId(post.id);
    try {
      const saveResponse = await fetch(`/api/brands/${brandId}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: editDraft.kind,
          title: editDraft.title,
          caption: editDraft.caption,
          imagePrompt: editDraft.imagePrompt,
          imageAspect: editDraft.imageAspect,
          notes: editDraft.notes,
          hashtags: parseHashtags(editDraft.hashtags),
          pageId: editDraft.pageId || null,
          pageName:
            pages.find((page) => page.id === editDraft.pageId)?.name ??
            editDraft.pageName,
          plannedAt: toIsoFromLocal(editDraft.scheduledAt),
          imageModelValue: safeImageModelValue(editDraft.imageModelValue),
        }),
      });
      const saveData = (await saveResponse.json()) as { error?: string };
      if (!saveResponse.ok) {
        setPostError(saveData.error ?? "Could not save post before generating.");
        return;
      }

      const response = await fetch(
        `/api/brands/${brandId}/posts/${post.id}/generate-assets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageModelValue: safeImageModelValue(editDraft.imageModelValue),
            generateMotion: false,
          }),
        },
      );
      const data = (await response.json()) as { error?: string; code?: string };
      if (!response.ok) {
        setPostError(data.error ?? "Could not generate assets.");
        setPostErrorCode(data.code ?? "");
        return;
      }
      router.refresh();
    } catch {
      setPostError("Could not reach wil. Try again.");
    } finally {
      setGeneratingPostId(null);
    }
  };

  const handleUploadImages = async (
    post: BrandPost,
    fileList: FileList | null,
  ) => {
    if (!fileList?.length || !editDraft) {
      return;
    }
    if (!canUploadImages(editDraft.kind)) {
      setPostError("Switch type to Image or Infographic to upload images.");
      return;
    }
    const remaining = MAX_BRAND_POST_IMAGES - postImages(post).length;
    if (remaining <= 0) {
      setPostError(`Limit is ${MAX_BRAND_POST_IMAGES} images per post.`);
      return;
    }
    setPostError("");
    setUploadingPostId(post.id);
    try {
      if (post.kind !== editDraft.kind) {
        const saveResponse = await fetch(
          `/api/brands/${brandId}/posts/${post.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: editDraft.kind }),
          },
        );
        if (!saveResponse.ok) {
          const saveData = (await saveResponse.json()) as { error?: string };
          setPostError(saveData.error ?? "Could not update post type.");
          return;
        }
      }

      const body = new FormData();
      body.set("postId", post.id);
      [...fileList].slice(0, remaining).forEach((file) => {
        body.append("file", file);
      });
      const response = await fetch(`/api/brands/${brandId}/media`, {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPostError(data.error ?? "Could not upload images.");
        return;
      }
      router.refresh();
    } catch {
      setPostError("Could not reach wil. Try again.");
    } finally {
      setUploadingPostId(null);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    setPostError("");
    try {
      const response = await fetch(`/api/brands/${brandId}/media/${mediaId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPostError(data.error ?? "Could not delete image.");
        return;
      }
      router.refresh();
    } catch {
      setPostError("Could not reach wil. Try again.");
    }
  };

  const renderPostImages = (
    post: BrandPost,
    options: { canDelete?: boolean } = {},
  ) => {
    const images = postImages(post);
    if (!images.length) {
      return null;
    }
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {images.map((item) => (
          <div key={item.id} className="relative">
            <button
              type="button"
              onClick={() => setPreviewMedia(item)}
              aria-label={`View ${item.fileName || "image"} full size`}
              className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.fileName || post.title || "Post image"}
                className="h-20 w-16 rounded-lg border border-line bg-navy-soft object-cover"
              />
            </button>
            {options.canDelete ? (
              <button
                type="button"
                onClick={() => void handleDeleteMedia(item.id)}
                className="absolute -right-1.5 -top-1.5 inline-flex size-6 items-center justify-center rounded-full border border-line bg-panel text-xs font-bold text-red-200 hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label={`Delete ${item.fileName || "image"}`}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const ghostActionClass =
    "rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

  const renderPostArchiveActions = (post: BrandPost) => {
    const busy = statusBusyId === post.id;
    const archived = isArchivedPost(post);
    if (showArchived) {
      return (
        <>
          {archived ? (
            <button
              type="button"
              onClick={() => void handleArchivePost(post)}
              disabled={busy}
              className={ghostActionClass}
              aria-label={`Restore ${post.title || post.kind}`}
            >
              {busy ? "Updating…" : "Restore"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleDeletePost(post)}
            disabled={busy}
            className={ghostActionClass}
            aria-label={`Delete ${post.title || post.kind}`}
          >
            {busy ? "Updating…" : "Delete"}
          </button>
        </>
      );
    }

    return (
      <button
        type="button"
        onClick={() => void handleArchivePost(post)}
        disabled={busy}
        className={ghostActionClass}
        aria-label={`Archive ${post.title || post.kind}`}
      >
        {busy ? "Updating…" : "Archive"}
      </button>
    );
  };

  const renderPostCard = (post: BrandPost) => {
    const isEditing = editingPostId === post.id && editDraft;
    const draft = isEditing ? editDraft : toPostEdit(post, defaultImageAi);

    if (isEditing) {
      return (
        <li key={post.id} className="rounded-2xl border border-accent bg-navy p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Edit post
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {draft.title || post.title || "Untitled"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseEdit}
              className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField htmlFor={`postKind-${post.id}`} label="Type">
              <select
                id={`postKind-${post.id}`}
                value={draft.kind}
                onChange={(event) =>
                  setEditDraft((current) =>
                    current ? { ...current, kind: event.target.value } : current,
                  )
                }
                className={fieldClassName}
                aria-label="Post type"
              >
                {BRAND_CONTENT_KINDS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField htmlFor={`postTitle-${post.id}`} label="Title">
              <input
                id={`postTitle-${post.id}`}
                value={draft.title}
                onChange={(event) =>
                  setEditDraft((current) =>
                    current ? { ...current, title: event.target.value } : current,
                  )
                }
                className={fieldClassName}
              />
            </FormField>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FormField htmlFor={`postPage-${post.id}`} label="Page">
              <select
                id={`postPage-${post.id}`}
                value={draft.pageId}
                onChange={(event) => {
                  const pageId = event.target.value;
                  const pageName =
                    pages.find((page) => page.id === pageId)?.name ?? "";
                  setEditDraft((current) =>
                    current ? { ...current, pageId, pageName } : current,
                  );
                }}
                className={fieldClassName}
                aria-label="Facebook page"
              >
                <option value="">Select a page</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              htmlFor={`postSchedule-${post.id}`}
              label="Schedule"
              tooltip="At least 10 minutes from now (Facebook)."
            >
              <input
                id={`postSchedule-${post.id}`}
                type="datetime-local"
                value={draft.scheduledAt}
                onChange={(event) =>
                  setEditDraft((current) =>
                    current
                      ? { ...current, scheduledAt: event.target.value }
                      : current,
                  )
                }
                className={fieldClassName}
                aria-label="Schedule"
              />
            </FormField>
          </div>
          {!pages.length ? (
            <p className="mt-2 text-xs text-muted">
              Connect Facebook on Social to choose a page.
            </p>
          ) : null}
          <div className="mt-3">
            <FormField htmlFor={`postCaption-${post.id}`} label="Caption">
              <textarea
                id={`postCaption-${post.id}`}
                rows={4}
                value={draft.caption}
                onChange={(event) =>
                  setEditDraft((current) =>
                    current
                      ? { ...current, caption: event.target.value }
                      : current,
                  )
                }
                className={fieldClassName}
              />
            </FormField>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FormField htmlFor={`postHashtags-${post.id}`} label="Hashtags">
              <input
                id={`postHashtags-${post.id}`}
                value={draft.hashtags}
                onChange={(event) =>
                  setEditDraft((current) =>
                    current
                      ? { ...current, hashtags: event.target.value }
                      : current,
                  )
                }
                className={fieldClassName}
                placeholder="brand, launch, tip"
              />
            </FormField>
            <FormField htmlFor={`postNotes-${post.id}`} label="Notes">
              <textarea
                id={`postNotes-${post.id}`}
                rows={2}
                value={draft.notes}
                onChange={(event) =>
                  setEditDraft((current) =>
                    current ? { ...current, notes: event.target.value } : current,
                  )
                }
                className={fieldClassName}
              />
            </FormField>
          </div>
          {isVisualKind(draft.kind) ? (
            <div className="mt-3 space-y-3">
              <FormField
                htmlFor={`postAspect-${post.id}`}
                label="Image ratio"
                hint={aspectHint(draft.imageAspect)}
              >
                <select
                  id={`postAspect-${post.id}`}
                  value={draft.imageAspect}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current
                        ? { ...current, imageAspect: event.target.value }
                        : current,
                    )
                  }
                  className={fieldClassName}
                  aria-label="Image ratio"
                >
                  {IMAGE_ASPECTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                htmlFor={`postImageAi-${post.id}`}
                label="Image AI"
                hint="Model used for stills."
              >
                <ImageAiSelect
                  id={`postImageAi-${post.id}`}
                  value={draft.imageModelValue}
                  onChange={(imageModelValue) =>
                    setEditDraft((current) =>
                      current ? { ...current, imageModelValue } : current,
                    )
                  }
                  ariaLabel={`Image AI for ${post.title || post.kind}`}
                  allowGemini={allowGemini}
                />
              </FormField>
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`postImagePrompt-${post.id}`}
                    className="text-sm font-semibold text-ink"
                  >
                    Image prompt
                  </label>
                  <button
                    type="button"
                    aria-label={`Regenerate prompt for ${post.title || post.kind}`}
                    disabled={Boolean(regeneratingPostId) || savingPostId === post.id}
                    onClick={() => handleRegeneratePrompt(post)}
                    className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-navy-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {regeneratingPostId === post.id
                      ? "Rewriting…"
                      : "Regenerate prompt"}
                  </button>
                </div>
                <textarea
                  id={`postImagePrompt-${post.id}`}
                  rows={3}
                  value={draft.imagePrompt}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current
                        ? { ...current, imagePrompt: event.target.value }
                        : current,
                    )
                  }
                  className={fieldClassName}
                />
              </div>
            </div>
          ) : null}
          {canUploadImages(draft.kind) || postImages(post).length ? (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  Images
                  {canUploadImages(draft.kind)
                    ? ` (${postImages(post).length}/${MAX_BRAND_POST_IMAGES})`
                    : ""}
                </p>
                {canUploadImages(draft.kind) &&
                postImages(post).length < MAX_BRAND_POST_IMAGES ? (
                  <label
                    className={`inline-flex items-center rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-navy-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                      uploadingPostId === post.id
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    {uploadingPostId === post.id ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="sr-only"
                      disabled={uploadingPostId === post.id}
                      aria-label={`Upload images for ${post.title || post.kind}`}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        void handleUploadImages(post, event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                ) : null}
              </div>
              {renderPostImages(post, { canDelete: true })}
              {canUploadImages(draft.kind) && !postImages(post).length ? (
                <p className="text-xs text-muted">
                  No images yet. Generate AI or upload up to {MAX_BRAND_POST_IMAGES}.
                </p>
              ) : null}
            </div>
          ) : null}
          {postError ? (
            <div className="mt-3">
              <UpgradeAlert error={postError} code={postErrorCode} />
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSavePost(post)}
              disabled={
                savingPostId === post.id ||
                generatingPostId === post.id ||
                uploadingPostId === post.id
              }
              className="btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {savingPostId === post.id ? "Saving…" : "Save"}
            </button>
            {renderPostArchiveActions(post)}
            {isVisualKind(draft.kind) ? (
              <button
                type="button"
                onClick={() => void handleGenerateAssets(post)}
                disabled={
                  generatingPostId === post.id ||
                  savingPostId === post.id ||
                  !hasLogo
                }
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                aria-label={`Generate AI and save ${post.title || post.kind}`}
              >
                {generatingPostId === post.id
                  ? "Generating…"
                  : "Generate AI and Save"}
              </button>
            ) : null}
          </div>
        </li>
      );
    }

    return (
      <li key={post.id} className="overflow-hidden rounded-2xl border border-line bg-panel">
        <BrandPostFeed
          post={post}
          onPreview={setPreviewMedia}
          footer={
            <>
              <p className="text-xs text-muted">Tap images to enlarge</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(post)}
                  className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  aria-label={`Edit ${post.title || post.kind}`}
                >
                  Edit
                </button>
                {renderPostArchiveActions(post)}
              </div>
            </>
          }
        />
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Content plan
          </h2>
          <p className="mt-1 text-sm text-muted">
            Review posts, pick a plan, and generate a new calendar.
          </p>
        </div>
        <button
          type="button"
          aria-label="New plan"
          disabled={isSubmitting}
          onClick={handleOpenModal}
          className="btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          + New plan
        </button>
      </div>

      {!hasLogo ? (
        <p className="rounded-xl border border-line bg-navy-soft px-3 py-2 text-sm text-muted">
          Visual posts need a logo. New plans default to text until a logo is
          uploaded on Kit.
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="auth-card rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                Posts
              </h3>
              <p className="mt-1 text-xs text-muted">
                {showAllPlans
                  ? `All plans · ${displayPosts.length} post(s)`
                  : selected
                    ? `${planLabel(selected)} · ${displayPosts.length} post(s)`
                    : "Select a plan"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex flex-wrap rounded-xl border border-line bg-navy-soft/60 p-1"
                role="group"
                aria-label="Filter by content kind"
              >
                {[
                  { value: "all", label: "All" },
                  ...BRAND_CONTENT_KINDS,
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={kindFilter === option.value}
                    onClick={() => handleSelectKind(option.value as KindFilter)}
                    className={chipClass(kindFilter === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div
                className="inline-flex rounded-xl border border-line bg-navy-soft/60 p-1"
                role="group"
                aria-label="Post sort"
              >
                <button
                  type="button"
                  aria-pressed={postSort === "scheduled"}
                  onClick={() => handleSelectSort("scheduled")}
                  className={chipClass(postSort === "scheduled")}
                >
                  Scheduled
                </button>
                <button
                  type="button"
                  aria-pressed={postSort === "created"}
                  onClick={() => handleSelectSort("created")}
                  className={chipClass(postSort === "created")}
                >
                  Created
                </button>
              </div>
              <div
                className="inline-flex rounded-xl border border-line bg-navy-soft/60 p-1"
                role="group"
                aria-label="Post view mode"
              >
                <button
                  type="button"
                  aria-pressed={postViewMode === "list"}
                  onClick={() => handleSelectView("list")}
                  className={chipClass(postViewMode === "list")}
                >
                  List
                </button>
                <button
                  type="button"
                  aria-pressed={postViewMode === "single"}
                  onClick={() => handleSelectView("single")}
                  className={chipClass(postViewMode === "single")}
                >
                  One by one
                </button>
              </div>
              <div
                className="inline-flex rounded-xl border border-line bg-navy-soft/60 p-1"
                role="group"
                aria-label="Archive view"
              >
                <button
                  type="button"
                  aria-pressed={!showArchived}
                  onClick={() => {
                    if (showArchived) {
                      handleToggleArchived();
                    }
                  }}
                  className={chipClass(!showArchived)}
                >
                  Active
                </button>
                <button
                  type="button"
                  aria-pressed={showArchived}
                  onClick={() => {
                    if (!showArchived) {
                      handleToggleArchived();
                    }
                  }}
                  className={chipClass(showArchived)}
                >
                  Archived
                </button>
              </div>
            </div>
          </div>

          {selected &&
          !showAllPlans &&
          (selected.status === "DRAFTING" || selected.status === "FAILED") ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Generate AI for this plan"
                disabled={generatingPlan || !hasLogo}
                onClick={() => void handleGeneratePlanAssets(selected.id)}
                className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {generatingPlan
                  ? "Generating…"
                  : selected.status === "FAILED"
                    ? "Retry Generate AI"
                    : "Generate AI"}
              </button>
              {selected.errorMessage ? (
                <p className="text-xs text-red-200">{selected.errorMessage}</p>
              ) : null}
            </div>
          ) : null}
          {error && !isModalOpen ? (
            <div className="mt-3">
              <UpgradeAlert error={error} code={errorCode} />
            </div>
          ) : null}
          {postError && !editingPostId ? (
            <div className="mt-3">
              <UpgradeAlert error={postError} code={postErrorCode} />
            </div>
          ) : null}

          {!sorted.length ? (
            <p className="mt-6 text-center text-sm text-muted">
              No plans yet. Create one to start.
            </p>
          ) : !displayPosts.length ? (
            <p className="mt-6 text-center text-sm text-muted">
              No posts match these filters.
            </p>
          ) : postViewMode === "single" ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted">
                  Post {safeSingleIndex + 1} of {displayPosts.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous post"
                    disabled={safeSingleIndex <= 0}
                    onClick={() => {
                      setSingleIndex((current) => Math.max(0, current - 1));
                      handleCloseEdit();
                    }}
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    aria-label="Next post"
                    disabled={safeSingleIndex >= displayPosts.length - 1}
                    onClick={() => {
                      setSingleIndex((current) =>
                        Math.min(displayPosts.length - 1, current + 1),
                      );
                      handleCloseEdit();
                    }}
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    Next
                  </button>
                </div>
              </div>
              <ul className="space-y-3">
                {displayPosts[safeSingleIndex]
                  ? renderPostCard(displayPosts[safeSingleIndex]!)
                  : null}
              </ul>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {postsByDay.map(([day, dayPosts]) => (
                <div key={day}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-[color:var(--button-ink)]">
                      {day + 1}
                    </span>
                    <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      Day {day + 1}
                    </p>
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    <span className="shrink-0 text-xs text-muted">
                      {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <ul className="space-y-3">{dayPosts.map(renderPostCard)}</ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="auth-card h-fit rounded-3xl p-5 xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              Content plans
            </h3>
            <span className="text-xs text-muted">
              {filteredPlans.length}/{scopedPlans.length}
            </span>
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Search content plans</span>
            <input
              type="search"
              value={planSearch}
              onChange={(event) => setPlanSearch(event.target.value)}
              placeholder="Search plans…"
              aria-label="Search content plans"
              className={fieldClassName}
            />
          </label>
          <button
            type="button"
            aria-pressed={showAllPlans}
            onClick={() => {
              setQueryPatch({ plan: "all" });
              setSingleIndex(0);
              handleCloseEdit();
            }}
            className={`mt-3 w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              showAllPlans
                ? "border-accent bg-navy-soft text-ink"
                : "border-line text-muted hover:bg-navy-soft"
            }`}
          >
            Show all content plans
          </button>
          <ul className="mt-3 max-h-[28rem] space-y-1.5 overflow-y-auto">
            {filteredPlans.length ? (
              filteredPlans.map((plan) => {
                const isActive = !showAllPlans && selected?.id === plan.id;
                const archived = isArchivedPlan(plan);
                return (
                  <li key={plan.id}>
                    <div
                      className={`flex items-stretch gap-1 rounded-xl border ${
                        isActive
                          ? "border-accent bg-navy-soft"
                          : "border-line hover:bg-navy-soft"
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={isActive}
                        aria-label={`Select plan ${planLabel(plan)}`}
                        onClick={() => {
                          setQueryPatch({ plan: plan.id });
                          setSingleIndex(0);
                          handleCloseEdit();
                        }}
                        className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <span className="block truncate font-medium text-ink">
                          {planLabel(plan)}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {plan.startDate.slice(0, 10)} · {plan.days}d ·{" "}
                          {plan.posts.length} posts · {plan.status}
                        </span>
                      </button>
                      <div className="flex shrink-0 flex-col justify-center gap-1 pr-2">
                        {archived ? (
                          <>
                            <button
                              type="button"
                              disabled={statusBusyId === plan.id}
                              onClick={() => void handleArchivePlan(plan)}
                              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted hover:text-ink disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              aria-label={`Restore plan ${planLabel(plan)}`}
                            >
                              {statusBusyId === plan.id ? "…" : "Restore"}
                            </button>
                            <button
                              type="button"
                              disabled={statusBusyId === plan.id}
                              onClick={() => void handleDeletePlan(plan)}
                              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted hover:text-ink disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              aria-label={`Delete plan ${planLabel(plan)}`}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={statusBusyId === plan.id}
                            onClick={() => void handleArchivePlan(plan)}
                            className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-muted hover:text-ink disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            aria-label={`Archive plan ${planLabel(plan)}`}
                          >
                            {statusBusyId === plan.id ? "…" : "Archive"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-1 py-4 text-center text-xs text-muted">
                {showArchived
                  ? "No archived plans."
                  : "No plans match your search."}
              </li>
            )}
          </ul>
        </aside>
      </div>

      <Modal
        title="New content plan"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="tall"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField htmlFor="planName" label="Plan name">
            <input
              id="planName"
              required
              maxLength={120}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className={fieldClassName}
              placeholder="e.g. March launch week"
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField htmlFor="planDays" label={`Days (${form.days})`}>
              <input
                id="planDays"
                type="range"
                min={MIN_PLAN_DAYS}
                max={planDayMax}
                value={form.days}
                onChange={(event) =>
                  handleScaleMix(
                    Number(event.target.value) || 1,
                    form.postsPerDay,
                  )
                }
                className="w-full"
                aria-valuenow={form.days}
              />
            </FormField>
            <FormField
              htmlFor="planPostsPerDay"
              label={`Posts per day (${form.postsPerDay})`}
              // hint={`Total: ${total}`}
            >
              <input
                id="planPostsPerDay"
                type="range"
                min={MIN_POSTS_PER_DAY}
                max={MAX_POSTS_PER_DAY}
                value={form.postsPerDay}
                onChange={(event) =>
                  handleScaleMix(
                    form.days,
                    clampPostsPerDay(Number(event.target.value)),
                  )
                }
                className="w-full"
                aria-valuenow={form.postsPerDay}
              />
            </FormField>
          </div>
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold text-ink">
              Platforms
            </legend>
            <div className="flex flex-wrap gap-2">
              {PLAN_PLATFORMS.map((option) => {
                const isSelected = form.platforms.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleTogglePlatform(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isSelected
                        ? "border-accent bg-accent text-[color:var(--button-ink)]"
                        : "border-line text-ink hover:bg-navy-soft"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <FormField htmlFor="planStart" label="Start date">
            <input
              id="planStart"
              type="date"
              required
              value={form.startDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className={fieldClassName}
            />
          </FormField>
          <FormField htmlFor="planBrief" label="Theme / brief">
            <textarea
              id="planBrief"
              rows={3}
              value={form.brief}
              onChange={(event) =>
                setForm((current) => ({ ...current, brief: event.target.value }))
              }
              className={fieldClassName}
            />
          </FormField>
          <FormField
            htmlFor="planImageAi"
            label="Image AI"
            hint="Creates IMAGE / VIDEO / INFOGRAPHIC stills for this plan."
          >
            <ImageAiSelect
              id="planImageAi"
              value={form.imageModelValue}
              onChange={(imageModelValue) =>
                setForm((current) => ({ ...current, imageModelValue }))
              }
              ariaLabel="Image AI model for this plan"
              allowGemini={allowGemini}
            />
          </FormField>
          <fieldset className="rounded-xl border border-line p-3">
            <legend className="mb-1.5 px-1 text-sm font-semibold text-ink">
              Mix (sum to {total})
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["text", "image", "video", "infographic"] as const).map(
                (key) => (
                  <label key={key} className="block text-sm">
                    <span className="capitalize text-muted">{key}</span>
                    <input
                      type="number"
                      min={0}
                      max={total}
                      value={form[key]}
                      aria-label={`${key} post count`}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: Math.max(
                            0,
                            Math.min(total, Number(event.target.value) || 0),
                          ),
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>
                ),
              )}
            </div>
            <p
              className={`mt-2 text-xs ${mixSum === total ? "text-muted" : "text-red-200"}`}
            >
              Sum: {mixSum} / {total}
            </p>
          </fieldset>
          {error ? <UpgradeAlert error={error} code={errorCode} /> : null}
          <button
            type="submit"
            disabled={
              isSubmitting || mixSum !== total || form.platforms.length < 1
            }
            className="btn-solid rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {isSubmitting ? "Generating…" : "Generate plan"}
          </button>
        </form>
      </Modal>
      <ConfirmModal
        title={confirmSpec?.title ?? ""}
        description={confirmSpec?.description ?? ""}
        confirmLabel={confirmSpec?.confirmLabel ?? "Confirm"}
        busyLabel={confirmSpec?.busyLabel}
        isOpen={Boolean(confirmSpec)}
        isBusy={Boolean(statusBusyId)}
        tone={confirmSpec?.tone ?? "default"}
        error={confirmError}
        onClose={handleCloseConfirm}
        onConfirm={() => void handleRunConfirm()}
      />
      <MediaPreview
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
