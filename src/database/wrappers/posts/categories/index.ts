import { DataModel } from "../../../data_model";
import {
    PostCategoryFields,
    PostCategoryModel,
} from "../../../models/posts/post_category";
import Tag from "../tags";
import reads from "./queries/reads";
import writes from "./queries/writes";

class Category extends DataModel implements PostCategoryModel {
    category_id: number;
    translations: { [key: string]: string };
    created_at: Date;
    updated_at: Date;

    constructor(
        category: PostCategoryFields | PostCategoryModel | Category,
        refetchOnUpdate: boolean = true
    ) {
        super(refetchOnUpdate);

        Object.assign(this, category);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const category = await reads.getCategoryById(this.category_id);
        if (category) {
            Object.assign(this, category);
        }
    }

    public async update(data: Partial<PostCategoryFields>): Promise<boolean> {
        this._refetch();

        const newCategory = { ...this, ...data };

        const r = await writes.updateCategory(
            this.category_id,
            newCategory.translations
        );

        if (r) {
            Object.assign(this, newCategory);
        }

        return r;
    }

    public async deleteCategory(): Promise<boolean> {
        try {
            return await writes.deleteCategory(this.category_id);
        } catch (e) {
            return false;
        }
    }

    public async deleteAllTags(): Promise<boolean> {
        try {
            const tags = await reads.fetchAllTagsByCategory(this.category_id);

            if (!tags) {
                return false;
            }

            for (const tag of tags) {
                new Tag(tag).deleteTag();
            }

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    addTranslation(language: string, translation: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    removeTranslation(language: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getTranslation(language: string): string | null {
        throw new Error("Method not implemented.");
    }

    getTranslations(): { [key: string]: string } {
        throw new Error("Method not implemented.");
    }
}

export default Category;
